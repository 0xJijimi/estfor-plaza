<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                Bridge {{ heroesToBridge.length }} Hero{{
                    heroesToBridge.length === 1 ? "" : "es"
                }}
            </h3>

            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="transferItems"
                :disabled="loading || itemsTransferredToBank"
            >
                1. Transfer All Items to Bank
            </button>
            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="bridgeHeroes"
                :disabled="loading || true"
            >
                2. Bridge {{ heroesToBridge.length }} Hero{{
                    heroesToBridge.length === 1 ? "" : "es"
                }} (Disabled)
            </button>
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
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useFactoryStore } from "../../store/factory"
import { useAppStore } from "../../store/app"
import { ProxySilo } from "../../store/models/factory.models"
import { allItems } from "../../data/items"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    chainId: {
        type: Number,
        required: true,
    },
})

const factoryStore = useFactoryStore()
const app = useAppStore()

const loading = ref(false)
const itemsTransferredToBank = ref(false)
const heroesToBridge = ref<ProxySilo[]>([])

const openDialog = async (heroes: ProxySilo[]) => {
    heroesToBridge.value = heroes
    itemsTransferredToBank.value = false
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const transferItems = async () => {
    loading.value = true
    try {
        const result = await factoryStore.getRelevantItemsForProxies(
            heroesToBridge.value,
            props.chainId as 250 | 146
        )
        await factoryStore.transferItemsToBank(
            result.distinctItems.filter(t => allItems.find(i => i.tokenId === t)?.isTransferable),
            heroesToBridge.value,
            props.chainId as 250 | 146,
            true
        )
        itemsTransferredToBank.value = true
    } catch (e) {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

const bridgeHeroes = async () => {
    loading.value = true
    try {
        await factoryStore.bridgeHeroes(
            heroesToBridge.value,
            props.chainId as 250 | 146
        )

        app.addToast(
            `${heroesToBridge.value.length} hero${
                heroesToBridge.value.length !== 1 ? "es" : ""
            } bridged`,
            "alert-success",
            5000
        )
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
    } catch (e) {
        console.error(e)
        // user declined tx
    } finally {
        // await factoryStore.getAllProxyStates(props.chainId as 250 | 146)
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
