<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <h2 class="text-2xl font-bold text-center">Assigned Heroes</h2>
            <div class="flex items-center justify-end">
                <div class="join items-center justify-end">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 mr-2 text-primary"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search"
                        class="input input-bordered bg-base-100-50 input-sm"
                        v-model="searchValue"
                    />
                </div>
                <AssignedHeroGroupSelect
                    class="ms-2"
                    v-model="selectedHeroGroup"
                    :heroes="factoryStore.assignedProxys"
                />
            </div>
            <div class="overflow-x-auto">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="w-[80px]">
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-primary"
                                    v-model="selectAll"
                                    @change="selectAllSilos"
                                />
                            </th>
                            <th>Name</th>
                            <th>Saved Action</th>
                            <th>Queued Action</th>
                            <th class="w-[80px] text-center">Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="silo in pagedAssignedSilos"
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
                                <div v-for="(action, i) in silo.queuedActions" :key="i" class="flex items-center justify-between">
                                    <div>{{ actionNames[Number(action.actionId)] || actionChoiceNames[Number(action.choice.id)] || "" }}</div>
                                    <div>{{ calculateTimeLeft(action) }}</div>
                                </div>
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
            <div v-if="assignedSilosRef.length > 20" class="join mx-auto">
                <button
                    :disabled="pageNumber === 0"
                    class="join-item btn btn-primary"
                    @click="pageNumber = pageNumber - 1"
                >
                    «
                </button>
                <button
                    v-for="p in pagesToSelect"
                    :key="p"
                    :disabled="p === pageNumber + 1"
                    class="join-item btn btn-primary"
                    @click="pageNumber = p - 1"
                >
                    {{ p }}
                </button>
                <button
                    :disabled="pageNumber + 1 === totalPages"
                    class="join-item btn btn-primary"
                    @click="pageNumber = pageNumber + 1"
                >
                    »
                </button>
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
                    class="btn btn-primary mt-5 me-2"
                    @click="evolveHeroes"
                    :disabled="executing || !selectedSilos.length"
                >
                    Evolve {{ selectedSilos.length }} Hero{{
                        selectedSilos.length !== 1 ? "es" : ""
                    }}
                </button>
                <button
                    type="button"
                    class="btn btn-primary mt-5 grow"
                    @click="openExecuteTransactions"
                    :disabled="!selectedSilos.length"
                >
                    Execute Actions for {{ selectedSilos.length }} Hero{{
                        selectedSilos.length !== 1 ? "es" : ""
                    }}
                </button>
            </div>
        </div>
    </div>
    <AssignHero ref="assignHeroRef" id="reassign_hero_modal" />
    <EvolveHero ref="evolveHeroRef" id="evolve_hero_modal" />
    <ExecuteSiloActions ref="executeActionsRef" id="execute_actions_modal" />
</template>

<script setup lang="ts">
import { SavedTransaction, useFactoryStore } from "../../store/factory"
import { computed, ref, watch } from "vue"
import AssignHero from "../dialogs/AssignHero.vue"
import { QueuedAction } from "@paintswap/estfor-definitions/types"
import estforPlayerAbi from "../../abi/estforPlayer.json"
import { actionChoiceNames, actionNames } from "../../store/skills"
import { decode } from "../../utils/abi"
import ExecuteSiloActions from "../dialogs/ExecuteSiloActions.vue"
import AssignedHeroGroupSelect from "../inputs/AssignedHeroGroupSelect.vue"
import EvolveHero from "../dialogs/EvolveHero.vue"

const factoryStore = useFactoryStore()
const executing = ref(false)
const pageSize = ref(20)
const pageNumber = ref(0)
const selectAll = ref(false)
const searchValue = ref("")
const selectedHeroGroup = ref("")

const assignHeroRef = ref<typeof AssignHero>()
const executeActionsRef = ref<typeof ExecuteSiloActions>()
const evolveHeroRef = ref<typeof EvolveHero>()

const decodeTransaction = (savedTransactions: SavedTransaction[]) => {
    if (savedTransactions.length === 0) {
        return "No action"
    }

    // first transaction is the action queue
    const decoded = decode(
        savedTransactions[0].data,
        "startActions",
        estforPlayerAbi
    )

    // [playerId, actions[[attire, actionId, regenId, choiceId], [], []], action queue type]
    const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
    const choiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
    return (
        actionNames[Number(actionId)] ||
        actionChoiceNames[Number(choiceId)] ||
        "Unknown"
    )
}

const assignedSilos = computed(() => {
    const assignedProxys = factoryStore.assignedProxys.filter(
        (s) =>
            s.playerState.name
                ?.toLowerCase()
                ?.indexOf(searchValue.value?.toLowerCase()) > -1 ||
            decodeTransaction(s.savedTransactions)
                ?.toLowerCase()
                ?.indexOf(searchValue.value?.toLowerCase()) > -1 ||
            s.queuedActions
                ?.map((a) => actionNames[Number(a.actionId)] || actionChoiceNames[Number(a.choice?.id)] || "")
                ?.join(" ")
                ?.toLowerCase()
                ?.indexOf(searchValue.value?.toLowerCase()) > -1
    ).filter(
        (s) => selectedHeroGroup.value === "" || decodeTransaction(s.savedTransactions) === selectedHeroGroup.value || s.queuedActions.map((a) => (actionNames[Number(a.actionId)] || actionChoiceNames[Number(a.choice?.id)] || "")).includes(selectedHeroGroup.value)
    )
    assignedProxys.sort((a, b) => {
        const aDecoded = decodeTransaction(a.savedTransactions)
        const bDecoded = decodeTransaction(b.savedTransactions)
        if (aDecoded < bDecoded) {
            return -1
        }
        if (aDecoded > bDecoded) {
            return 1
        }
        return 0
    })
    return assignedProxys
})
const assignedSilosRef = ref(
    assignedSilos.value.map((s) => ({ ...s, selected: false }))
)

const pagedAssignedSilos = computed(() => {
    const start = pageNumber.value * pageSize.value
    return assignedSilosRef.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => {
    return Math.ceil(assignedSilosRef.value.length / pageSize.value)
})

const pagesToSelect = computed(() => {
    const pages = []
    if (totalPages.value > 5) {
        if (pageNumber.value + 1 < 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
        } else if (pageNumber.value + 1 > totalPages.value - 3) {
            for (let i = totalPages.value - 4; i < totalPages.value + 1; i++) {
                pages.push(i)
            }
        } else {
            for (let i = pageNumber.value - 1; i < pageNumber.value + 4; i++) {
                pages.push(i)
            }
        }
    } else {
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i)
        }
    }
    return pages
})

const selectAllSilos = () => {
    for (const silo of assignedSilosRef.value) {
        silo.selected = selectAll.value
    }
}

const selectedSilos = computed(() =>
    assignedSilosRef.value.filter((s) => s.selected)
)

const openExecuteTransactions = () => {
    executeActionsRef.value?.openDialog(selectedSilos.value)
}

const assignHeroes = () => {
    assignHeroRef.value?.openDialog(
        assignedSilosRef.value.filter((x) => x.selected)
    )
}

const evolveHeroes = () => {
    evolveHeroRef.value?.openDialog(
        assignedSilosRef.value.filter((x) => x.selected && !x.playerState.isFullMode)
    )
}

const calculateTimeLeft = (queuedAction: QueuedAction) => {
    const startTime = parseInt(queuedAction.startTime)
    const endTime = startTime + queuedAction.timespan
    const timeLeft = endTime * 1000 - Date.now()
    // return time left in hours only
    return timeLeft > 0 ? `${Math.round(timeLeft / 1000 / 60 / 60)}h` : "Ready"
}

watch(
    () => assignedSilos.value,
    () => {
        assignedSilosRef.value = assignedSilos.value.map((s) => ({
            ...s,
            selected: false,
        }))
    }
, { deep: true })
</script>
