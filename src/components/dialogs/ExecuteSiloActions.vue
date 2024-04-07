<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <div v-if="!transferScreenSelected">
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
                </button>
                <button
                    type="button"
                    class="btn btn-primary mt-5 w-full"
                    @click="goToTransferScreen"
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
                <div
                    v-if="loading && factoryStore.currentTransactionNumber > 0"
                    class="mt-5"
                >
                    Executing
                    <span class="text-success">{{
                        factoryStore.currentTransactionNumber
                    }}</span>
                    of
                    <span class="text-success">{{
                        factoryStore.totalTransactionNumber
                    }}</span>
                    transactions
                </div>
                <div v-else-if="loading" class="mt-5">
                    Calculating transactions... Please wait
                </div>
            </div>

            <div v-if="transferScreenSelected">
                <h3 class="font-bold text-lg text-center">
                    Transfer Items to Bank
                </h3>

                <div class="flex">
                    <button
                        type="button"
                        class="btn btn-primary btn-sm my-5"
                        @click="transferScreenSelected = false"
                    >
                        Go Back
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary btn-sm my-5 ms-2"
                        @click="selectAllItems(toggle)"
                    >
                        {{ toggle ? 'Select' : 'Deselect' }} All Items
                    </button>
                </div>

                <span
                    v-if="loading"
                    class="loading loading-spinner text-primary loading-md mx-auto text-gray-100"
                ></span>

                <div v-if="!loading" v-for="token in relevantTokens" :key="token.tokenId">
                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-5">
                            <input
                                type="checkbox"
                                v-model="token.selected"
                                :checked="token.selected"
                                class="checkbox checkbox-primary card"
                            />
                            <span class="label-text mt-1">
                                {{ itemNames[token.tokenId] }}
                            </span>
                        </label>
                    </div>
                </div>                

                <div class="mt-5 text-sm">
                    Don't transfer the tools your heroes are currently using!
                </div>

                <button
                    type="button"
                    class="btn btn-primary mt-5 w-full"
                    @click="transferItemsToBank"
                    :disabled="loading || itemsTransferredToBank || relevantTokens.filter(t => t.selected).length === 0"
                >
                    Transfer Items to Bank
                </button>
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
import { itemNames, starterItems } from "../../store/items"
import { allItems } from "../../data/items"

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
const transferScreenSelected = ref(false)
const toggle = ref(true)
const relevantTokens = ref<{ selected: boolean, tokenId: number }[]>([])

const silosWithEmptyQueuesOrActionInputOnly = computed(() => {
    return silosToExecute.value.filter(
        (s) =>
            s.queuedActions.length === 0 ||
            s.queuedActions.every((a) => a.choice === null)
    )
})

const silosWithActionChoicesOnly = computed(() => {
    return silosToExecute.value.filter(
        (s) =>
            s.queuedActions.length > 0 &&
            s.queuedActions.some((a) => a.choice !== null)
    )
})

const selectAllItems = (selected: boolean) => {
    for (const token of relevantTokens.value) {
        token.selected = selected
    }
    toggle.value = !toggle.value
}

const openDialog = (heroes: ProxySilo[]) => {
    itemsTransferredToBank.value = false
    actionInputsExecuted.value = false
    silosToExecute.value = heroes
    missingItems.value = []
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const executeSavedTransactions = async () => {
    loading.value = true
    try {
        await factoryStore.executeSavedTransactions(
            silosWithEmptyQueuesOrActionInputOnly.value
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
    } catch (e) {
        console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

const goToTransferScreen = async () => {
    transferScreenSelected.value = true
    loading.value = true
    try {
        const result = await factoryStore.getRelevantItemsForProxies(silosToExecute.value)
        relevantTokens.value = result.distinctItems.map(t => ({ selected: result.relevantTokenIds.includes(t), tokenId: t })).filter((i) => allItems.find(t => t.tokenId === i.tokenId)?.isTransferable && !starterItems.includes(i.tokenId))
    } catch {
        // 
    } finally {
        loading.value = false    
    }
}

const transferItemsToBank = async () => {
    loading.value = true
    try {
        await factoryStore.transferItemsToBank(relevantTokens.value.filter(t => t.selected).map(t => t.tokenId), silosToExecute.value)
        app.addToast(`Items transferred to Bank`, "alert-success", 5000)
        itemsTransferredToBank.value = true
        transferScreenSelected.value = false
    } catch {
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
            for (const action of proxy.queuedActions.filter(x => x.choice !== null)) {
                let i = 0
                for (const input of action.choice.inputTokenIds) {
                    const ownedItem = userItemNFTResult?.userItemNFTs.find(
                        (t) => t.tokenId === input
                    )

                    const now = Date.now() / 1000
                    let amountRequired = 0
                    if (Number(action.startTime) + action.timespan < now) {
                        amountRequired =
                            (action.choice.inputAmounts[i] *
                                (action.choice.rate / 1000) *
                                action.timespan) /
                            60 /
                            60
                    } else if (Number(action.startTime) < now) {
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

            for (const tokenId in itemTotals) {
                const ownedItem = bankItems.find((t) => Number(t.tokenId) === Number(tokenId))                
                if (!ownedItem || itemTotals[tokenId] > Number(ownedItem.amount)) {
                    missingItems.value.push(
                        `${itemTotals[tokenId] - Number(ownedItem?.amount || 0)} ${
                            itemNames[Number(tokenId)]
                        } is missing from the Bank`
                    )
                }
            }

            if (missingItems.value.length === 0) {
                await factoryStore.transferItemsFromBankToProxys(itemsNeeded)
                await factoryStore.executeSavedTransactions(
                    silosWithActionChoicesOnly.value
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
    } catch (e) {
        console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
