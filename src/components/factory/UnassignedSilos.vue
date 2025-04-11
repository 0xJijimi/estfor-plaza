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
                            <th>Class/Level</th>
                            <th>Name</th>
                            <th class="w-[80px] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="silo in pagedUnassignedSilos"
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
                                {{ silo.class }}
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
            <div v-if="unassignedSilosRef.length > pageSize" class="join mx-auto">
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
    <AssignHero
        ref="assignHeroRef"
        id="assign_hero_modal"
        :chainId="props.chainId"
    />
</template>

<script setup lang="ts">
import { useFactoryStore } from "../../store/factory"
import { computed, ref, watch } from "vue"
import AssignHero from "../dialogs/AssignHero.vue"
import {
    Player,
} from "@paintswap/estfor-definitions/types"
import { getLevel } from "../../store/core"

const props = defineProps<{
    chainId: 146
}>()

const factoryStore = useFactoryStore()
const assigningHeroes = ref(false)
const selectAll = ref(false)
const pageSize = ref(20)
const pageNumber = ref(0)

const assignHeroRef = ref<typeof AssignHero>()

const getHeroClass = (playerState: Player) => {
    const alchemyLevel = getLevel(playerState.alchemyXP)
    const meleeLevel = getLevel(playerState.meleeXP)
    const rangedLevel = getLevel(playerState.rangedXP)
    const magicLevel = getLevel(playerState.magicXP)
    const defenceLevel = getLevel(playerState.defenceXP)
    const farmingLevel = getLevel(playerState.farmingXP)
    const fishingLevel = getLevel(playerState.fishingXP)
    const forgeLevel = getLevel(playerState.forgingXP)
    const craftingLevel = getLevel(playerState.craftingXP)
    const woodcuttingLevel = getLevel(playerState.woodcuttingXP)
    const miningLevel = getLevel(playerState.miningXP)
    const cookingLevel = getLevel(playerState.cookingXP)
    const smithingLevel = getLevel(playerState.smithingXP)
    const fletchingLevel = getLevel(playerState.fletchingXP)
    const thievingLevel = getLevel(playerState.thievingXP)
    const firemakingLevel = getLevel(playerState.firemakingXP)

    const highestLevel = Math.max(alchemyLevel, meleeLevel, rangedLevel, magicLevel, defenceLevel, farmingLevel, fishingLevel, forgeLevel, craftingLevel, woodcuttingLevel, miningLevel, cookingLevel, smithingLevel, fletchingLevel, thievingLevel, firemakingLevel)
    
    // compare highest level to each class level
    if (highestLevel === alchemyLevel) {
        return `Alchemist (${alchemyLevel})`
    } else if (highestLevel === meleeLevel) {
        return `Warrior (${meleeLevel})`
    } else if (highestLevel === rangedLevel) {
        return `Archer (${rangedLevel})`
    } else if (highestLevel === magicLevel) {
        return `Mage (${magicLevel})`
    } else if (highestLevel === defenceLevel) {
        return `Defender (${defenceLevel})`
    } else if (highestLevel === farmingLevel) {
        return `Farmer (${farmingLevel})`
    } else if (highestLevel === fishingLevel) {
        return `Fisherman (${fishingLevel})`
    } else if (highestLevel === forgeLevel) {
        return `Forger (${forgeLevel})`
    } else if (highestLevel === craftingLevel) {
        return `Crafter (${craftingLevel})`
    } else if (highestLevel === woodcuttingLevel) {
        return `Lumberjack (${woodcuttingLevel})`
    } else if (highestLevel === miningLevel) {
        return `Miner (${miningLevel})`
    } else if (highestLevel === cookingLevel) {
        return `Cook (${cookingLevel})`
    } else if (highestLevel === smithingLevel) {
        return `Blacksmith (${smithingLevel})`
    } else if (highestLevel === fletchingLevel) {
        return `Fletcher (${fletchingLevel})`
    } else if (highestLevel === thievingLevel) {
        return `Thief (${thievingLevel})`
    } else if (highestLevel === firemakingLevel) {
        return `Firemaker (${firemakingLevel})`
    }
    return "Unknown"
}

const getUnassignedSilos = () => {
    const silos = unassignedSilos.value.map((s) => ({ ...s, selected: false, class: getHeroClass(s.playerState) }))
    silos.sort((a, b) => {
        if (a.class > b.class) {
            return -1
        } else if (a.class < b.class) {
            return 1
        }
        return 0
    })
    return silos
}

const unassignedSilos = computed(() => factoryStore.unassignedProxys)
const unassignedSilosRef = ref(
    getUnassignedSilos()
)

const pagedUnassignedSilos = computed(() => {
    const start = pageNumber.value * pageSize.value
    return unassignedSilosRef.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => {
    return Math.ceil(unassignedSilosRef.value.length / pageSize.value)
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
        const newSilos = unassignedSilos.value.map((s) => ({
            ...s,
            selected: false,
            class: getHeroClass(s.playerState)
        }))
        newSilos.sort((a, b) => {
            if (a.class > b.class) {
                return -1
            } else if (a.class < b.class) {
                return 1
            }
            return 0
        })
        unassignedSilosRef.value = newSilos
    }
)
</script>
