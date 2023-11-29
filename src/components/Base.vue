<template>
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
import { onMounted, ref, watch } from 'vue'
import { useCoreStore } from '../store/core'

const coreStore = useCoreStore()
const loading = ref(false)

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

