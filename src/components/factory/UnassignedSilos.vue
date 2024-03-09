<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <h2 class="text-2xl font-bold text-center">Unassigned Heroes</h2>
            <div class="overflow-x-auto">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="w-[80px] text-center"></th>
                            <th>Name</th>
                            <th class="w-[80px] text-center">Is Paused</th>
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
                                <div v-else class="badge badge-success">
                                    Active
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                class="btn btn-primary my-2"
                @click="assignHeroes"
                :disabled="assigningHeroes || !selectedSilos.length"
            >
                Assign {{ selectedSilos.length }} Hero{{
                    selectedSilos.length > 1 ? "es" : ""
                }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFactoryStore } from "../../store/factory"
import { useAppStore } from "../../store/app"
import { computed, ref, watch } from "vue"

const factoryStore = useFactoryStore()
const app = useAppStore()
const assigningHeroes = ref(false)

const unassignedSilos = computed(() => factoryStore.unassignedProxys)
const unassignedSilosRef = ref(
    unassignedSilos.value.map((s) => ({ ...s, selected: false }))
)

const selectedSilos = computed(() =>
    unassignedSilosRef.value.filter((s) => s.selected)
)

const assignHeroes = () => {
    app.addToast(
        `NOT IMPLEMENTED YET - Soon you can assign the selected heroes to a task`,
        "alert-success",
        5000
    )
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
