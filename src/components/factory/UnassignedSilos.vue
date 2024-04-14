<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 w-full md:basis-3/4 xl:basis-1/2"
    >
        <div class="card-body">
            <h2 class="text-2xl font-bold text-center">Unassigned Heroes</h2>
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
                            <th class="w-[80px] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="silo in unassignedSilosRef"
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
                        </tr>
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                class="btn btn-primary mt-5"
                @click="assignHeroes"
                :disabled="assigningHeroes || !selectedSilos.length"
            >
                Assign {{ selectedSilos.length }} Hero{{
                    selectedSilos.length !== 1 ? "es" : ""
                }}
            </button>
        </div>
    </div>
    <AssignHero ref="assignHeroRef" id="assign_hero_modal" />
</template>

<script setup lang="ts">
import { useFactoryStore } from "../../store/factory"
import { computed, ref, watch } from "vue"
import AssignHero from "../dialogs/AssignHero.vue"

const factoryStore = useFactoryStore()
const assigningHeroes = ref(false)
const selectAll = ref(false)

const assignHeroRef = ref<typeof AssignHero>()

const unassignedSilos = computed(() => factoryStore.unassignedProxys)
const unassignedSilosRef = ref(
    unassignedSilos.value.map((s) => ({ ...s, selected: false }))
)

const selectedSilos = computed(() =>
    unassignedSilosRef.value.filter((s) => s.selected)
)

const assignHeroes = () => {
    assignHeroRef.value?.openDialog(
        unassignedSilosRef.value.filter((x) => x.selected)
    )
}

const selectAllSilos = () => {
    for (const silo of unassignedSilosRef.value) {
        silo.selected = selectAll.value
    }
}

watch(
    () => unassignedSilos.value,
    () => {
        unassignedSilosRef.value = unassignedSilos.value.map((s) => ({
            ...s,
            selected: false,
        }))
    }
)
</script>
