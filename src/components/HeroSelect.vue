<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10">
        <div class="card-body flex flex-row max-md:flex-col gap-5 items-center">
            <div class="flex-initial w-1/3 min-w-[200px]">
                <Avatar :id="coreStore.playerState.avatarId" :name="coreStore.playerState.name" />
            </div>
            <div class="grow overflow-x-auto">
                <table class="table md:table-md table-xs text-lg">
                    <caption class="caption-top">
                        Hero Roster
                    </caption>
                    <thead>
                    <tr>
                        <th class="w-[100px] text-center">Avatar</th>
                        <th>Name</th>
                        <th class="w-[100px] text-right">Battle Points</th>
                        <th class="w-[210px]"></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="h in coreStore.heroRoster" :key="h.id">
                        <td><img :src="`https://media.estfor.com/characters/${h.avatarId}.jpg`" class="rounded-lg" /> </td>
                        <td>{{ h.name }}</td>
                        <td class="w-[100px] text-right">{{ getDiceRolls(h) }}</td>
                        <td>
                            <button type="button" class="btn btn-primary mr-2" :disabled="coreStore.playerId == h.id" @click.prevent="selectHero(h)">Select</button>
                            <button type="button" class="btn btn-error btn-outline" :disabled="coreStore.playerId == h.id" @click.prevent="coreStore.removeHeroFromRoster(h)">Remove</button>
                        </td>
                    </tr>
                    <tr v-if="coreStore.heroRoster.length === 0">
                        <td colspan="3" class="text-center">No heroes in roster</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10">
        <div class="card-body">
            <div class="join items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2 text-primary">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input type="text" placeholder="Hero Search" class="input input-bordered bg-base-100-50" v-model="heroSearch" />
            </div>

            <div class="text-center mt-5">
                <div>Here you can select any hero and load their skills into the Plaza to calculate their combat stats and skill training times. <img src="/src/assets/emerald_brooch_icon.png" class="rounded-lg w-[20px] inline cursor-pointer" alt="Emerald Brooch" @click.prevent="emeraldBroochPaywallRef?.openDialog()" /></div>
                <ol class="list-decimal list-inside mt-5">
                    <li>Search for the hero name</li>
                    <li>Click on the hero portrait you wish to load</li>
                </ol>
            </div>

            <div v-if="loading" class="mx-auto my-[100px] w-full text-center">
                <span class="loading loading-spinner text-primary loading-md mx-auto"></span>
            </div>

            <div v-if="!loading" class="flex flex-wrap justify-evenly">
                <div v-for="p in heroSearchResults" :key="p.id" class="lg:w-1/5 md:w-1/4 sm:w-1/3 w-1/2 cursor-pointer hover:bg-base-100-50 rounded-lg px-5 pb-5 " @click.prevent="selectHero(p)">
                    <Avatar :id="p.avatarId" :name="p.name" />
                </div>
            </div>
        </div>
    </div>
    <EmeraldBroochPaywall ref="emeraldBroochPaywallRef" />
</template>

<script setup lang="ts">
import Avatar from './Avatar.vue'
import { ref } from "vue"
import { watchDebounced } from '@vueuse/core'
import { getPlayers } from '../utils/api';
import { useAppStore } from '../store/app';
import { useCoreStore } from '../store/core';
import EmeraldBroochPaywall from './dialogs/EmeraldBroochPaywall.vue';
import { Player } from '@paintswap/estfor-definitions/types';
import { getDiceRolls } from '../store/clan';

const app = useAppStore()
const coreStore = useCoreStore()

const heroSearch = ref('')
const heroSearchResults = ref<Player[]>([])
const loading = ref(false)

const emeraldBroochPaywallRef = ref<typeof EmeraldBroochPaywall>()

watchDebounced(heroSearch, async () => {
    if (heroSearch.value === '') {
        heroSearchResults.value = []
        return
    }
    loading.value = true
    try {
        const players = await getPlayers(heroSearch.value)
        heroSearchResults.value = players.players
    } catch (e) {
        console.error(`Failed to search ${heroSearch.value}`, e)
    } finally {
        loading.value = false
    }
}, { debounce: 500 })

const selectHero = async (player: Player) => {
    loading.value = true
    const previousHeroSearchValue = heroSearch.value
    try {
        await coreStore.loadPlayer(player.id)
        heroSearch.value = player.name
        app.addToast(`${player.name} loaded`, 'alert-success', 5000)
    } catch (e: any) {
        if (e.message === 'NO_EMERALD_BROOCH') {
            emeraldBroochPaywallRef.value?.openDialog()
        } else {
            console.error(`Failed to load ${player.name}`, e)
            app.addToast(`Failed to load ${player.name}`, 'alert-error', 5000)
        }
        loading.value = false
    } finally {
        // case when selecting the hero with the same name as the search term
        if (previousHeroSearchValue === heroSearch.value) {
            loading.value = false
        }
    }
}
</script>