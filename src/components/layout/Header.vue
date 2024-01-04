<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { getAccount } from '@wagmi/core'
import { useItemStore, itemNames } from "../../store/items"
import Donate from "../dialogs/Donate.vue"
import { useRoute } from "vue-router"
import { useBroochStore } from "../../store/brooch"

const itemStore = useItemStore()
const broochStore = useBroochStore()

const route = useRoute()
const broochTimeout = ref<number>(0)

const donateRef = ref<typeof Donate>()

// const showBrooch = () => {
//     if (broochStore.brooch(0).balance === 0) {
//         donateRef.value?.openDialog()
//     }
// }

const allItemNames = computed(() => {
    return Object.values(itemNames)
})

const init = async () => {
    try {
        window.clearTimeout(broochTimeout.value)
        const account = getAccount()
        if (account.isConnected) {
            if (broochStore.brooch(0).balance < 1) {
                broochTimeout.value = window.setTimeout(() => {
                    donateRef.value?.openDialog()
                }, 60000 * 5) // 5 minutes
            }
        }
    } catch (e) {
        console.log(e)
    }
}

watch(() => broochStore.brooch(0).balance, init)
</script>

<template>
    <nav class="navbar bg-base-100-50 border-solid border-b-2 border-primary">
        <div class="navbar-start">
            <img width="46" src="/src/assets/logo.png" class="ml-2 cursor-pointer" @click.prevent="donateRef?.openDialog()">
            <router-link to="/hero-select" class="max-md:hidden btn btn-ghost mr-2 ml-2">Hero Select</router-link>
            <span class="max-md:hidden">|</span>
            <ul class="menu menu-horizontal max-md:hidden">
                <li>
                    <details>
                        <summary>The Plaza</summary>
                        <ul class="bg-base-100 z-[1]">
                            <li><router-link to="/combat">Combat Calculator</router-link></li>
                            <li><router-link to="/skills">Skill Training</router-link></li>
                            <li><router-link to="/lotteries">Wishing Well Ranking</router-link></li>
                            <!-- <li><router-link to="/clan-battle" @click="showBrooch">Clan Battle <img src="/src/assets/emerald_brooch_icon.png" class="rounded-lg w-[20px] inline cursor-pointer" alt="Emerald Brooch" /></router-link></li> -->
                        </ul>
                    </details>
                </li>
            </ul>
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn m-1 border-0 md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>
                <ul tabindex="0" class="z-[1] menu dropdown-content p-2 shadow bg-base-100 rounded-box w-52">
                    <li><router-link to="/hero-select">Hero Select</router-link></li>
                    <li><router-link to="/combat">Combat Calculator</router-link> </li>
                    <li><router-link to="/skills">Skill Training</router-link></li>
                    <li><router-link to="/lotteries">Wishing Well Ranking</router-link></li>
                    <!-- <li><router-link to="/clan-battle" @click="showBrooch">Clan Battle <img src="/src/assets/emerald_brooch_icon.png" class="rounded-lg w-[20px] inline cursor-pointer" alt="Emerald Brooch" /></router-link></li> -->
                </ul>
            </div>
        </div>
        <div class="navbar-end">
            <!-- <button class="btn btn-ghost btn-circle" v-if="isDark" @click="onThemeToggle('light')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
            </button>
            <button class="btn btn-ghost btn-circle" v-if="!isDark" @click="onThemeToggle('dark')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
                </svg>
            </button> -->
            <div v-if="route.meta.showItemSearch" class="join max-lg:hidden items-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2 text-primary">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input type="text" placeholder="Item Search" class="input input-sm input-bordered max-w-xs bg-base-100-50" v-model="itemStore.itemSearch" list="item-datalist" />
                <datalist id="item-datalist">
                    <option v-for="item in allItemNames" :key="item" :value="item" />
                </datalist>
            </div>
            <w3m-button />
        </div>
    </nav>
    <Donate ref="donateRef" />
</template>

<style scoped>
.chain-icon {
    max-width: 40px;
    max-height: 40px;
    min-width: 40px;
    min-height: 40px;
}

.small-chain-icon {
    max-height: 30px;
    max-width: 30px;
}

.navbar-end {
    min-width: 280px;
}
</style>
