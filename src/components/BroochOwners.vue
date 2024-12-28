<template>
    <div>
        <div>
            EMERALD
            <div v-for="owner in currentOwners.emeraldBroochOwners" :key="owner.internal_id">
                {{ owner.owner }} {{ owner.value }}
            </div>
        </div>
        <div>
            RUBY
            <div v-for="owner in currentOwners.rubyBroochOwners" :key="owner.internal_id">  
                {{ owner.owner }} {{ owner.value }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import gql from "graphql-tag"
import { useQuery } from "@vue/apollo-composable"

const previousCount = ref(0)
const loading = ref(false)
const transferSingles = ref<any[]>([])

const BROOCH_UPGRADER = "0x46951e514b955e85846c21a1a722dd8426c9e25f"

const currentOwners = computed(() => {
    const emeraldBroochOwners: any[] = []
    const rubyBroochOwners: any[] = []

    const sortedTransferSingles = [...transferSingles.value].sort((a: any, b: any) => {
        if (Number(a.blockNumber) > Number(b.blockNumber)) {
            return 1
        } else if (Number(a.blockNumber) < Number(b.blockNumber)) {
            return -1
        } else {
            return 0
        }
    })

    for (const transfer of sortedTransferSingles) {
        // handle mints
        if (transfer.from === "0x0000000000000000000000000000000000000000") {
            if (transfer.internal_id === "0") {
                const owner = emeraldBroochOwners.find((x: any) => x.owner === transfer.to)
                if (owner) {
                    owner.value += 1
                } else {
                    emeraldBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            } else {
                const owner = rubyBroochOwners.find((x: any) => x.owner === transfer.to)
                if (owner) {
                    owner.value += 1
                } else {
                    rubyBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            }
        }
        
        // handle upgrades
        if (transfer.to === BROOCH_UPGRADER) {
            const owner = emeraldBroochOwners.find((x: any) => x.internal_id === transfer.internal_id && x.owner === transfer.from)
            if (owner) {
                owner.value -= 1
            }
        }

        // handle user transfers
        if (transfer.from !== "0x0000000000000000000000000000000000000000" && transfer.to !== BROOCH_UPGRADER) {
            if (transfer.internal_id === "0") {
                const owner = emeraldBroochOwners.find((x: any) => x.internal_id === transfer.internal_id && x.owner === transfer.from)
                if (owner) {
                    owner.value -= 1
                }

                const newOwner = emeraldBroochOwners.find((x: any) => x.owner === transfer.to)
                if (newOwner) {
                    newOwner.value += 1
                } else {
                    emeraldBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            } else {
                const owner = rubyBroochOwners.find((x: any) => x.internal_id === transfer.internal_id && x.owner === transfer.from)
                if (owner) {
                    owner.value -= 1
                }

                const newOwner = rubyBroochOwners.find((x: any) => x.owner === transfer.to)
                if (newOwner) {
                    newOwner.value += 1
                } else {
                    rubyBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            }
        }
    }

    return { emeraldBroochOwners: emeraldBroochOwners.filter((x: any) => x.value > 0), rubyBroochOwners: rubyBroochOwners.filter((x: any) => x.value > 0) }
})

const { fetchMore, onResult } = useQuery(
    gql`
        query getTransfers($offset: Int) {
            transferSingles(skip: $offset) {
                internal_id
                blockNumber
                from
                to
                value
            }
        }
    `,
    () => ({
        offset: 0,
    })
)

onResult(async (v) => {
    if (v.data) {
        if (v?.data?.transferSingles?.length > 0) {
            if (
                v.data?.transferSingles.length !== previousCount.value
            ) {
                await fetchMore({
                    variables: {
                        offset: v?.data?.transferSingles?.length,
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                        if (!fetchMoreResult) {
                            return previousResult
                        }
                        return {
                            transferSingles: [
                                ...previousResult.transferSingles,
                                ...fetchMoreResult.transferSingles,
                            ],
                        }
                    },
                })
            } else {
                transferSingles.value = v.data?.transferSingles
                loading.value = false
            }
            previousCount.value = v.data?.transferSingles.length
        } else {
            loading.value = false
        }
    }
})
</script>

