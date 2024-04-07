<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <p>
                Welcome to the Factory floor! Here you can create silos for your
                Estfor heroes and tell them to do things.
            </p>
            <p v-if="!hasRubyBrooch" class="alert alert-warning my-5">
                <img
                    src="/src/assets/ruby_brooch_icon.png"
                    class="rounded-lg w-[20px] inline cursor-pointer"
                    alt="Ruby Brooch"
                    @click.prevent="rubyBroochPaywallRef?.openDialog()"
                />
                <span
                    >As you don't have a Ruby Brooch, you do not get the full
                    benefits of the Factory - there is a
                    {{
                        Number(
                            factoryStore.transactionCharge / BigInt(10 ** 15)
                        ) / 1000 || "small"
                    }}
                    FTM charge per execution, and you cannot batch execute
                    actions.<br />If you want to get a Ruby Brooch, first get an
                    Emerald Brooch (click the tree icon in the top left), then
                    click the Ruby brooch to the left of this message.</span
                >
            </p>
            <span
                v-if="loading"
                class="loading loading-spinner text-primary loading-md mx-auto"
            ></span>
            <div v-else>
                <p>
                    You currently have
                    <span class="text-lg text-success">{{
                        factoryStore.proxys.length
                    }}</span>
                    silos.
                </p>
                <div class="flex justify-start mt-5">
                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">Silos to create</span>
                        </div>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            class="input input-sm input-bordered bg-base-100-50"
                            v-model="silosToCreate"
                        />
                    </label>
                </div>
                <div class="flex">
                    <button
                        type="button"
                        class="btn btn-primary mt-5 me-2"
                        @click="viewSilos"
                    >
                        View Silos
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary mt-5 grow"
                        @click="createSilos"
                        :disabled="loading || creating"
                    >
                        Create {{ Math.floor(silosToCreate) }} Silo{{
                            silosToCreate > 1 ? "s" : ""
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <EmptySilos
        v-if="factoryStore.emptyProxys.length > 0"
        @create-heroes="onCreateHeroes"
    />
    <UnassignedSilos v-if="factoryStore.unassignedProxys.length > 0" />
    <ItemBank v-if="factoryStore.proxys.length > 0" />
    <AssignedSilos v-if="factoryStore.assignedProxys.length > 0" />
    <ViewSilos ref="viewSilosRef" />
    <RubyBroochPaywall
        ref="rubyBroochPaywallRef"
        id="factory_ruby_brooch_modal"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useFactoryStore } from "../store/factory"
import { useAppStore } from "../store/app"
import { useQuery } from "@vue/apollo-composable"
import gql from "graphql-tag"
import EmptySilos from "./factory/EmptySilos.vue"
import UnassignedSilos from "./factory/UnassignedSilos.vue"
import AssignedSilos from "./factory/AssignedSilos.vue"
import { getAccount } from "@wagmi/core"
import ItemBank from "./factory/ItemBank.vue"
import ViewSilos from "./dialogs/ViewSilos.vue"
import { config } from "../config"
import { useBroochStore } from "../store/brooch"
import RubyBroochPaywall from "./dialogs/RubyBroochPaywall.vue"

const factoryStore = useFactoryStore()
const app = useAppStore()
const broochStore = useBroochStore()
const loading = ref(false)
const creating = ref(false)
const silosToCreate = ref(5)

const viewSilosRef = ref<typeof ViewSilos>()

const account = getAccount(config)
const hasRubyBrooch = computed(() => broochStore.hasAccess(1))

const rubyBroochPaywallRef = ref<typeof RubyBroochPaywall>()

const { result, onError, refetch, fetchMore } = useQuery(
    gql`
    query getProxys($offset: Int) {
        factoryRegistryCreateds(skip: $offset, where: { owner: "${account.address}" }) {
            sender
            owner
            proxy
            proxyId
        }
    }
`,
    () => ({
        offset: 0,
    })
)

watch(result, async (v) => {
    if (v?.factoryRegistryCreateds?.length > 0) {
        if (v.factoryRegistryCreateds.length % 100 === 0) {
            const a = await fetchMore({
                variables: {
                    offset: v?.factoryRegistryCreateds?.length,
                },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                    if (!fetchMoreResult) {
                        return previousResult
                    }
                    return {
                        factoryRegistryCreateds: [
                            ...previousResult.factoryRegistryCreateds,
                            ...fetchMoreResult.factoryRegistryCreateds,
                        ],
                    }
                },
            })
            if (a?.data?.factoryRegistryCreateds?.length === 0) {
                await factoryStore.setProxys(v.factoryRegistryCreateds)
                await factoryStore.getAllProxyStates()
            }
        } else {
            await factoryStore.setProxys(v.factoryRegistryCreateds)
            await factoryStore.getAllProxyStates()
        }
    }
})

const onCreateHeroes = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await refetch()
}

const createSilos = async () => {
    creating.value = true
    try {
        const originalProxyCount = factoryStore.proxys.length
        await factoryStore.createProxy(silosToCreate.value)
        app.addToast(
            `${silosToCreate.value} silo${
                silosToCreate.value > 1 ? "s" : ""
            } created`,
            "alert-success",
            5000
        )

        while (factoryStore.proxys.length === originalProxyCount) {
            await refetch()
            await new Promise((resolve) => setTimeout(resolve, 2000))
        }
    } catch {
        // user rejected tx
        // console.error(e)
    } finally {
        creating.value = false
    }
}

const viewSilos = () => {
    viewSilosRef.value?.openDialog()
}

onError(async () => {
    loading.value = true
    try {
        await factoryStore.getProxys()
        await factoryStore.getAllProxyStates()
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
})
</script>
