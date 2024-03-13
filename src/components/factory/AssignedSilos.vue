<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <h2 class="text-2xl font-bold text-center">Assigned Heroes</h2>
            <div class="overflow-x-auto">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="w-[80px] text-center"></th>
                            <th>Name</th>
                            <th>Saved Action</th>
                            <th>Time Left</th>
                            <th class="w-[80px] text-center">Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="silo in assignedSilosRef"
                            :key="silo.address"
                        >
                            <td>
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-primary"
                                    v-model="silo.selected"
                                />
                            </td>
                            <td>
                                {{ silo.playerState.name }}
                            </td>
                            <td>
                                {{ decodeTransaction(silo.savedTransactions) }}
                            </td>
                            <td>
                                {{ calculateTimeLeft(silo.queuedActions) }}
                            </td>
                            <td>
                                <div
                                    v-if="silo.isPaused"
                                    class="badge badge-warning p-3"
                                >
                                    Paused
                                </div>
                                <div
                                    v-else
                                    class="badge badge-primary text-white"
                                >
                                    Active
                                </div>
                            </td>
                            <td>
                                <a
                                    :href="`https://estfor.com/journal/${silo.playerId}`"
                                    target="_blank"
                                    class="max-sm:hidden"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-6 h-6"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                        />
                                    </svg>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex">
                <button
                    type="button"
                    class="btn btn-primary mt-5 me-2"
                    @click="assignHeroes"
                    :disabled="executing || !selectedSilos.length"
                >
                    Reassign {{ selectedSilos.length }} Hero{{
                        selectedSilos.length !== 1 ? "es" : ""
                    }}
                </button>
                <button
                    type="button"
                    class="btn btn-primary mt-5 grow"
                    @click="executeSavedTransactions"
                    :disabled="executing || !selectedSilos.length"
                >
                    Execute Actions for {{ selectedSilos.length }} Hero{{
                        selectedSilos.length !== 1 ? "es" : ""
                    }}
                </button>
            </div>
        </div>
    </div>
    <AssignHero ref="assignHeroRef" id="reassign_hero_modal" />
</template>

<script setup lang="ts">
import { useAppStore } from "../../store/app"
import { SavedTransaction, useFactoryStore } from "../../store/factory"
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import AssignHero from "../dialogs/AssignHero.vue"
import { QueuedAction } from "@paintswap/estfor-definitions/types"
import { Interface } from "ethers"
import estforPlayerAbi from "../../abi/estforPlayer.json"
import { actionNames } from "../../store/skills"
import { searchQueuedActions } from "../../utils/api"

const factoryStore = useFactoryStore()
const app = useAppStore()
const executing = ref(false)
const interval = ref<NodeJS.Timeout>()

const assignHeroRef = ref<typeof AssignHero>()

const assignedSilos = computed(() => factoryStore.assignedProxys)
const assignedSilosRef = ref(
    assignedSilos.value.map((s, i) => ({ ...s, selected: i === 0 }))
)

const selectedSilos = computed(() =>
    assignedSilosRef.value.filter((s) => s.selected)
)

const assignHeroes = () => {
    assignHeroRef.value?.openDialog(
        assignedSilosRef.value.filter((x) => x.selected)
    )
}

const executeSavedTransactions = async () => {
    executing.value = true
    try {
        await factoryStore.executeSavedTransactions(selectedSilos.value)
        app.addToast(
            `${selectedSilos.value.length} hero${
                selectedSilos.value.length !== 1 ? "es" : ""
            } actions executed`,
            "alert-success",
            5000
        )
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        executing.value = false
    }
}

const calculateTimeLeft = (queuedActions: QueuedAction[]) => {
    if (queuedActions.length === 0) {
        return "Ready"
    }
    const totalTime = queuedActions.reduce(
        (acc, action) => acc + action.timespan,
        0
    )
    const startTime = parseInt(queuedActions[0].startTime)
    const endTime = startTime + totalTime
    const timeLeft = endTime * 1000 - Date.now()
    // return time left in hours only
    return timeLeft > 0 ? `${Math.round(timeLeft / 1000 / 60 / 60)}h` : "Ready"
}

const decodeTransaction = (savedTransactions: SavedTransaction[]) => {
    if (savedTransactions.length === 0) {
        return "No action"
    }
    // first transaction is the action queue
    const data = savedTransactions[0].data
    const playersInterface = new Interface(estforPlayerAbi)
    const decoded = playersInterface.decodeFunctionData("startActions", data)
    // [playerId, actions[[attire, actionId, ...], [], []], action queue type]
    const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
    return actionNames[Number(actionId)] || "Unknown"
}

onMounted(() => {
    clearInterval(interval.value)
    interval.value = setInterval(async () => {
        for (const silo of assignedSilos.value) {
            const queuedActions = await searchQueuedActions(silo.playerId)
            factoryStore.setQueuedActions(
                silo.playerId,
                queuedActions.queuedActions
            )
        }
    }, 1000 * 60) // every minute
})

onUnmounted(() => {
    clearInterval(interval.value)
})

watch(
    () => assignedSilos.value,
    () => {
        assignedSilosRef.value = assignedSilos.value.map((s) => ({
            ...s,
            selected: false,
        }))
    }
)
</script>
