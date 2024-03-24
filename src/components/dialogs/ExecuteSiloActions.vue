<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                Execute {{ silosToExecute.length }} Action{{
                    silosToExecute.length === 1 ? "" : "s"
                }}
            </h3>

            <div class="mt-5">
                Please execute the following in order unless you know what
                you're doing.
            </div>

            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="executeSavedTransactions"
                :disabled="
                    loading ||
                    silosWithEmptyQueuesOrActionInputOnly.length === 0 ||
                    actionInputsExecuted
                "
            >
                1. Execute
                {{ silosWithEmptyQueuesOrActionInputOnly.length }} Simple
                Action{{
                    silosWithEmptyQueuesOrActionInputOnly.length === 1
                        ? ""
                        : "s"
                }}
                {{
                    actionInputsNeededTransactions > 1
                        ? `(${actionInputsNeededTransactions} transactions)`
                        : ""
                }}
            </button>
            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="transferItemsToBank"
                :disabled="loading || itemsTransferredToBank"
            >
                2. Transfer Items to Bank
            </button>
            <button
                v-if="silosWithActionChoicesOnly.length > 0"
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="executeActionChoiceSavedTransactions"
                :disabled="loading"
            >
                3. Execute {{ silosWithActionChoicesOnly.length }} Complex
                Action{{ silosWithActionChoicesOnly.length === 1 ? "" : "s" }}
                {{
                    actionInputChoicesNeededTransactions > 1
                        ? `(${actionInputChoicesNeededTransactions} transactions)`
                        : ""
                }}
            </button>
            <div class="mt-5">
                <div
                    v-for="item in missingItems"
                    :key="item"
                    class="text-error text-sm"
                >
                    {{ item }}
                </div>
            </div>
            <div v-if="loading" class="mt-5">
                Please wait while the transaction is being processed.
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { ProxySilo, NeededItem, useFactoryStore } from "../../store/factory"
import { getUserItemNFTs } from "../../utils/api"
import { useAppStore } from "../../store/app"
import { itemNames } from "../../store/items"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const factoryStore = useFactoryStore()
const app = useAppStore()

const loading = ref(false)
const actionInputsExecuted = ref(false)
const itemsTransferredToBank = ref(false)
const silosToExecute = ref<ProxySilo[]>([])
const missingItems = ref<string[]>([])
const chunks = ref(10)
const actionChoiceChunks = ref(10)

// gas cost for execute action is 800k gas, split into chunks of 10
const actionInputsNeededTransactions = computed(() => {
    return Math.ceil(
        silosWithEmptyQueuesOrActionInputOnly.value.length / chunks.value
    )
})

const silosWithEmptyQueuesOrActionInputOnly = computed(() => {
    return silosToExecute.value.filter(
        (s) =>
            s.queuedActions.length === 0 ||
            s.queuedActions.every((a) => a.choice === null)
    )
})

// gas cost for execute action is 800k gas, split into chunks of 10
const actionInputChoicesNeededTransactions = computed(() => {
    return Math.ceil(
        silosWithActionChoicesOnly.value.length / actionChoiceChunks.value
    )
})

const silosWithActionChoicesOnly = computed(() => {
    return silosToExecute.value.filter((s) =>
        s.queuedActions.every((a) => a.choice !== null)
    )
})

const openDialog = (heroes: ProxySilo[]) => {
    silosToExecute.value = heroes
    missingItems.value = []
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const executeSavedTransactions = async () => {
    loading.value = true
    try {
        await factoryStore.executeSavedTransactions(
            silosWithEmptyQueuesOrActionInputOnly.value,
            chunks.value
        )
        app.addToast(
            `${silosWithEmptyQueuesOrActionInputOnly.value.length} hero${
                silosWithEmptyQueuesOrActionInputOnly.value.length !== 1
                    ? "es"
                    : ""
            } actions executed`,
            "alert-success",
            5000
        )
        actionInputsExecuted.value = true
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

const transferItemsToBank = async () => {
    loading.value = true
    try {
        await factoryStore.transferItemsToBank()
        app.addToast(`Items transferred to Bank`, "alert-success", 5000)
        itemsTransferredToBank.value = true
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

const executeActionChoiceSavedTransactions = async () => {
    loading.value = true
    missingItems.value = []
    try {
        const userItemNFTPromises = await Promise.all(
            silosWithActionChoicesOnly.value.map((s) =>
                getUserItemNFTs(s.address, [])
            )
        )

        const itemsNeeded: NeededItem[] = []
        for (const proxy of silosWithActionChoicesOnly.value) {
            const userItemNFTResult = userItemNFTPromises.find((u) =>
                u.userItemNFTs.some((t) => t.user === proxy.address)
            )
            for (const action of proxy.queuedActions) {
                let i = 0
                for (const input of action.choice.inputTokenIds) {
                    const ownedItem = userItemNFTResult?.userItemNFTs.find(
                        (t) => t.tokenId === input
                    )

                    const now = Date.now() / 1000
                    let amountRequired = 0
                    if (Number(action.startTime) + action.timespan < now) {
                        amountRequired =
                            action.choice.inputAmounts[i] *
                            (action.choice.rate / 1000) *
                            24
                    } else {
                        amountRequired =
                            action.choice.inputAmounts[i] *
                            (action.choice.rate / 1000) *
                            Math.ceil(
                                (now - Number(action.startTime)) / 60 / 60
                            )
                    }

                    if (
                        !ownedItem ||
                        Number(ownedItem.amount) < amountRequired
                    ) {
                        const proxyItemsNeeded = itemsNeeded.find(
                            (i) => i.address === proxy.address
                        )
                        const totalAmountRequired = Math.ceil(
                            amountRequired -
                                (ownedItem ? Number(ownedItem.amount) : 0)
                        )
                        if (!proxyItemsNeeded) {
                            itemsNeeded.push({
                                address: proxy.address,
                                items: [
                                    {
                                        tokenId: input,
                                        amount: totalAmountRequired,
                                    },
                                ],
                            })
                        } else {
                            proxyItemsNeeded.items.push({
                                tokenId: input,
                                amount: totalAmountRequired,
                            })
                        }
                    }
                }
            }
        }

        if (factoryStore.bank) {
            const itemResult = await getUserItemNFTs(
                factoryStore.bank?.address,
                []
            )
            const bankItems = itemResult.userItemNFTs

            const itemTotals: { [key: string]: number } = {}
            for (const item of itemsNeeded) {
                for (const i of item.items) {
                    if (itemTotals[i.tokenId]) {
                        itemTotals[i.tokenId] += i.amount
                    } else {
                        itemTotals[i.tokenId] = i.amount
                    }
                }
            }

            for (const item of bankItems) {
                if (itemTotals[item.tokenId] > Number(item.amount)) {
                    missingItems.value.push(
                        `${itemTotals[item.tokenId] - Number(item.amount)} ${
                            itemNames[item.tokenId]
                        } is missing from the Bank`
                    )
                }
            }

            if (missingItems.value.length === 0) {
                await factoryStore.transferItemsFromBankToProxys(itemsNeeded)
                await factoryStore.executeSavedTransactions(
                    silosWithActionChoicesOnly.value,
                    actionChoiceChunks.value
                )
                app.addToast(
                    `${silosWithActionChoicesOnly.value.length} hero${
                        silosWithActionChoicesOnly.value.length !== 1
                            ? "es"
                            : ""
                    } actions executed`,
                    "alert-success",
                    5000
                )
                await factoryStore.updateQueuedActions()
                const dialog = document.getElementById(
                    props.id
                ) as HTMLDialogElement
                dialog.close()
            }
        }
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
