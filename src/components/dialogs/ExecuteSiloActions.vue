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
                    Action{{
                        silosWithActionChoicesOnly.length === 1 ? "" : "s"
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
                <div v-else-if="error" class="mt-5 text-error">
                    {{ error }}
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
                        {{ toggle ? "Select" : "Deselect" }} All Items
                    </button>
                </div>

                <span
                    v-if="loading"
                    class="loading loading-spinner text-primary loading-md mx-auto text-gray-100"
                ></span>

                <div
                    v-if="!loading"
                    v-for="token in relevantTokens"
                    :key="token.tokenId"
                >
                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-5">
                            <input
                                type="checkbox"
                                v-model="token.selected"
                                :checked="token.selected"
                                class="checkbox checkbox-primary card"
                            />
                            <span
                                class="label-text mt-1 flex gap-2 items-center"
                            >
                                {{ itemNames[token.tokenId] }}
                                <span
                                    v-if="isRequiredTool(token.tokenId)"
                                    class="tooltip tooltip-primary"
                                    data-tip="This is currently being used by a hero"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-6 h-6 text-warning"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                        />
                                    </svg>
                                </span>
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
                    :disabled="
                        loading ||
                        itemsTransferredToBank ||
                        relevantTokens.filter((t) => t.selected).length === 0
                    "
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
import { allActions } from "../../data/actions"
import { getActionChoiceById } from "../../store/skills"

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
const error = ref<string | null>(null)
const relevantTokens = ref<{ selected: boolean; tokenId: number }[]>([])

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

const isRequiredTool = (tokenId: number): boolean => {
    for (const p of factoryStore.assignedProxys) {
        for (const a of p.queuedActions) {
            if (a.choice) {
                const choice = getActionChoiceById(
                    a.actionId,
                    Number(a.choice.id)
                )
                const action = allActions.find((x) => x.info.skill == a.skill)
                const max = action?.info.handItemTokenIdRangeMax
                const min = action?.info.handItemTokenIdRangeMin

                const requiredItems = Array.from(
                    { length: max - min + 1 },
                    (_, i) => i + min
                )

                const choiceMax = choice?.handItemTokenIdRangeMax
                const choiceMin = choice?.handItemTokenIdRangeMin

                const choiceRequiredItems = Array.from(
                    { length: choiceMax - choiceMin + 1 },
                    (_, i) => i + choiceMin
                )

                if (
                    requiredItems.includes(tokenId) ||
                    choiceRequiredItems.includes(tokenId)
                ) {
                    return true
                }
            } else {
                const action = allActions.find((x) => x.actionId == a.actionId)
                const max = action?.info.handItemTokenIdRangeMax
                const min = action?.info.handItemTokenIdRangeMin

                const requiredItems = Array.from(
                    { length: max - min + 1 },
                    (_, i) => i + min
                )

                if (requiredItems.includes(tokenId)) {
                    return true
                }
            }
        }
    }
    return false
}

const executeSavedTransactions = async () => {
    loading.value = true
    error.value = null
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
    } catch (e: any) {
        // console.error(e)
        if (e.message?.indexOf("User rejected the request") > -1) {
            return
        }
        error.value =
            "Could not create a transaction. Please check your heroes have the correct tools equipped."
    } finally {
        loading.value = false
    }
}

const goToTransferScreen = async () => {
    transferScreenSelected.value = true
    loading.value = true
    try {
        const result = await factoryStore.getRelevantItemsForProxies(
            silosToExecute.value
        )
        relevantTokens.value = result.distinctItems
            .map((t) => ({
                selected: result.relevantTokenIds.includes(t),
                tokenId: t,
            }))
            .filter(
                (i) =>
                    allItems.find((t) => t.tokenId === i.tokenId)
                        ?.isTransferable && !starterItems.includes(i.tokenId)
            )
    } catch {
        //
    } finally {
        loading.value = false
    }
}

const transferItemsToBank = async () => {
    loading.value = true
    try {
        await factoryStore.transferItemsToBank(
            relevantTokens.value
                .filter((t) => t.selected)
                .map((t) => t.tokenId),
            silosToExecute.value
        )
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
            for (const action of proxy.queuedActions.filter(
                (x) => x.choice !== null
            )) {
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
                    i++
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
                const ownedItem = bankItems.find(
                    (t) => Number(t.tokenId) === Number(tokenId)
                )
                if (
                    !ownedItem ||
                    itemTotals[tokenId] > Number(ownedItem.amount)
                ) {
                    missingItems.value.push(
                        `${
                            itemTotals[tokenId] - Number(ownedItem?.amount || 0)
                        } ${
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
