<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
// import { useAppStore } from "../../store/app"
import { useCoreStore, Network } from "../../store/core"
import { account, disconnect, connect, accountDetails, chain, getAvailableChains, switchChain, Chain, readContract} from '@kolirt/vue-web3-auth'
import { icons } from "../../utils/icons"
import { useItemStore, itemNames } from "../../store/items"
import broochAbi from '../../abi/brooch.json'
import Donate from "../dialogs/Donate.vue"
import { HOMEMADE_BROOCH_ADDRESS } from "../../utils/addresses"

// const appStore = useAppStore()
const coreStore = useCoreStore()
const itemStore = useItemStore()

const donateRef = ref<typeof Donate>()

const allItemNames = computed(() => {
    return Object.values(itemNames)
})

// const isDark = computed(() => appStore.theme === "dark")

// const onThemeToggle = (theme: string) => {
//     appStore.setTheme(theme)
// }

const onSwitchChain = (network: string) => {
    switchChain(getAvailableChains().find(x => x.network == network) as Chain)
}

const init = async () => {
    try {
        if (account.connected) {
            const balance = await readContract({
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: 'balanceOf',
                args: [account.address, 0],
            }) as unknown as number
            if (balance < 1) {
                setTimeout(() => {
                    donateRef.value?.openDialog()
                }, 60000 * 5) // 5 minutes
            }
        }
    } catch (e) {
        console.log(e)
    }
}

watch(chain, (newValue: Chain) => {
    coreStore.setCurrentNetwork(newValue.network as Network)
})

watch(account, init)

const currentIcon = computed(() => {
    return icons.find(x => x.name == coreStore.connectedNetwork)?.icon
})

const getChainName = (network: string) => {
    return getAvailableChains().find(x => x.network == network)?.name
}

onMounted(init)
</script>

<template>
    <nav class="navbar bg-base-100-50 border-solid border-b-2 border-primary">
        <div class="navbar-start">
            <img width="46" src="/src/assets/logo.png" class="ml-2 cursor-pointer" @click.prevent="donateRef?.openDialog()">          
            <router-link to="/" class="max-md:hidden btn btn-ghost ml-4 mr-2">Combat Calculator</router-link> 
            <span class="max-md:hidden">|</span>
            <router-link to="/skills" class="max-md:hidden btn btn-ghost ml-2">Skill Training</router-link>
            <div class="md:hidden dropdown">
                <div tabindex="0" role="button" class="btn m-1 border-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>
                <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><router-link to="/">Combat Calculator</router-link> </li>
                    <li> <router-link to="/skills">Skill Training</router-link></li>
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
            <div class="join max-md:hidden items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2 text-primary">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input type="text" placeholder="Item Search" class="input input-sm input-bordered max-w-xs bg-base-100-50" v-model="itemStore.itemSearch" list="item-datalist" />
                <datalist id="item-datalist">
                    <option v-for="item in allItemNames" :key="item" :value="item" />
                </datalist>
            </div>
            <div v-if="account.connected">
                <div class="dropdown align-top">
                    <button tabindex="0" class="btn btn-circle btn-ghost"><img :src="currentIcon" :alt="coreStore.connectedNetwork" class="small-chain-icon" /></button>
                    <div tabindex="0" class="shadow dropdown-content bg-base-200 z-20">
                        <div v-for="icon in icons" :key="icon.name" class="flex items-center gap-4 cursor-pointer py-2 px-4 rounded-md border-primary border-2 border-solid hover:border-white" @click="onSwitchChain(icon.name)">
                            <img :src="icon.icon" :alt="icon.name" class="flex-none chain-icon" />
                            <div class="flex">{{ getChainName(icon.name) }}</div>
                        </div>
                    </div>
                </div>
                <button @click="accountDetails()" class="btn btn-ghost align-top">
                    {{ account.shortAddress }}
                </button>
                <button @click="disconnect()" class="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <button v-else @click="connect()" class="btn btn-ghost">
                Connect
            </button>
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
