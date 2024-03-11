<template>
    <div role="alert" class="alert alert-warning mt-10 mx-auto md:w-[760px]">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
        <span
            >This feature is experimental and in an alpha state. Heroes and/or
            items may end up lost! Please report any bugs to me, and don't try
            to do too much at once - there are no gas limit calculations yet
        </span>
    </div>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <p>
                Welcome to the Factory floor! Here you can create silos for your
                Estfor heroes and tell them to do things.
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
                            max="10"
                            class="input input-sm input-bordered bg-base-100-50"
                            v-model="silosToCreate"
                        />
                    </label>
                </div>
                <button
                    type="button"
                    class="btn btn-primary my-2 w-full"
                    @click="createSilos"
                    :disabled="loading || creating"
                >
                    Create {{ silosToCreate }} Silo{{
                        silosToCreate > 1 ? "s" : ""
                    }}
                </button>
            </div>
        </div>
    </div>
    <EmptySilos v-if="factoryStore.emptyProxys.length > 0" />
    <UnassignedSilos v-if="factoryStore.unassignedProxys.length > 0" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useFactoryStore } from "../store/factory"
import { useAppStore } from "../store/app"
import { useQuery } from "@vue/apollo-composable"
import gql from "graphql-tag"
import EmptySilos from "./factory/EmptySilos.vue"
import UnassignedSilos from "./factory/UnassignedSilos.vue"
import { getAccount } from "@wagmi/core"

const factoryStore = useFactoryStore()
const app = useAppStore()
const loading = ref(false)
const creating = ref(false)
const silosToCreate = ref(5)

const account = getAccount()

const { result, onError, refetch } = useQuery(gql`
    query getProxys {
        factoryRegistryCreateds(where: { owner: "${account.address}" }) {
            sender
            owner
            proxy
            proxyId
        }
    }
`)

watch(result, async (v) => {
    if (v?.factoryRegistryCreateds?.length > 0) {
        await factoryStore.setProxys(v.factoryRegistryCreateds)
        await factoryStore.getAllProxyStates()
    }
})

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
