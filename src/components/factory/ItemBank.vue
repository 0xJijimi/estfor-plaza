<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <h2 class="text-2xl font-bold text-center">Item Bank</h2>
            <h3 class="text-sm text-center">{{ bank?.address }}</h3>

            <div v-if="bank?.playerId !== ''">
                <b class="font-bold">{{ bank?.playerState.name }}</b> is the
                acting Treasurer. All items will be sent to and received from
                them.
            </div>

            <div v-if="aggregatedItems.length > 0" class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-right">Amount</th>
                            <th class="text-right">Incoming / day</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in aggregatedItems" :key="item.tokenId">
                            <td>
                                {{ itemNames[item.tokenId] || item.tokenId }}
                            </td>
                            <td class="text-right">{{ item.amount }}</td>
                            <td class="text-success text-right">
                                +{{ (item.rate * period).toFixed(0) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex">
                <button
                    type="button"
                    class="btn btn-primary mt-5 grow"
                    @click="withdrawItems"
                >
                    Withdraw Items
                </button>
            </div>
        </div>
    </div>
    <WithdrawFromBank
        ref="withdrawFromBankRef"
        id="withdraw_from_bank_modal"
        @withdrawn="init"
    />
</template>

<script setup lang="ts">
import {
    AggregatedItem,
    getIncomingItems,
    useFactoryStore,
} from "../../store/factory"
import { ComputedRef, computed, onMounted, ref } from "vue"
import { itemNames } from "../../store/items"
import { getUserItemNFTs } from "../../utils/api"
import { UserItemNFT } from "@paintswap/estfor-definitions/types"
import WithdrawFromBank from "../dialogs/WithdrawFromBank.vue"

const factoryStore = useFactoryStore()
const period = ref(24)
const bankItems = ref<UserItemNFT[]>([])

const withdrawFromBankRef = ref<typeof WithdrawFromBank>()

const bank = computed(() => {
    return factoryStore.bank
})

const aggregatedItems: ComputedRef<AggregatedItem[]> = computed(() => {
    const incomingItems: any[] = getIncomingItems(factoryStore.assignedProxys)

    // merge bankItems and incomingItems
    const mergedItems: AggregatedItem[] = bankItems.value.map((item) => {
        const incomingItem = incomingItems.find(
            (i) => i.itemTokenId === item.tokenId
        )
        if (incomingItem) {
            return {
                tokenId: item.tokenId,
                amount: item.amount,
                rate: incomingItem.rate,
            }
        }
        return {
            tokenId: item.tokenId,
            amount: item.amount,
            rate: 0,
        }
    })

    // add missing incomingItems
    for (const item of incomingItems) {
        if (!mergedItems.find((i) => i.tokenId === item.itemTokenId)) {
            mergedItems.push({
                tokenId: item.itemTokenId,
                amount: "0",
                rate: item.rate,
            })
        }
    }

    mergedItems.sort((a, b) => {
        if (a.rate > b.rate) return -1
        if (a.rate < b.rate) return 1
        return 0
    })

    return mergedItems
})

const withdrawItems = async () => {
    withdrawFromBankRef.value?.openDialog(aggregatedItems.value)
}

const init = async () => {
    try {
        if (bank.value) {
            const itemResult = await getUserItemNFTs(bank.value?.address, [])
            bankItems.value = itemResult.userItemNFTs
        }
    } catch {
        // console.error(e)
    }
}

onMounted(init)
</script>
