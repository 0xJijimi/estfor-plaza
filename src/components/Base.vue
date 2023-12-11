<template>
    <div v-for="toast in toasts" :key="toast.id" class="toast toast-top toast-end">
        <div class="alert text-white" :class="toast.class">
            <svg v-if="toast.class == 'alert-error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <svg v-if="toast.class == 'alert-success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ toast.text }}</span>
        </div>
    </div>
    <div class="container mx-auto">
        <div v-if="!account.connected" class="card md:w-[500px] bg-base-100-50 shadow-xl mx-auto my-[100px] p-10">
            <div class="text-center">
                <h2 class="text-2xl font-bold">Welcome to Deif's Estfor Plaza!</h2>
                <p class="text-lg">Connect your wallet below</p>
            </div>
            <div class="text-center my-4">
                <button class="btn btn-primary" @click="connect()">Connect Wallet</button>
            </div>
        </div>
        <div v-else-if="loading" class="mx-auto my-[100px] w-[500px] text-center">
            <span class="loading loading-spinner text-primary loading-md mx-auto"></span>
        </div>
        <div v-else>
            <RouterView />
        </div>
    </div>
</template>

<script setup lang="ts">
import { chain, account, connect } from '@kolirt/vue-web3-auth'
import { computed, onMounted, ref, watch } from 'vue'
import { useCoreStore } from '../store/core'
import { useAppStore } from '../store/app'

const coreStore = useCoreStore()
const app = useAppStore()
const loading = ref(false)

const toasts = computed(() => app.toasts)

const init = async () => {
    try {
        if (account.connected) {
            loading.value = true
            await coreStore.getActivePlayer()
        }
    } catch (e) {
        console.log(e)  
    } finally {
        loading.value = false
    }
}

onMounted(init)

watch([chain, account], init)
</script>

<style>
.toast {
    z-index: 99999 !important;
}
</style>
