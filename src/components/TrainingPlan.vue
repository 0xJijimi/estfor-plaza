<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10">
        <div class="card-body flex flex-row max-md:flex-col gap-5 items-center">
            <div class="text-center">
                Select what skills you want to train up to which level and I'll tell you what materials you'll need and how long you'll need to train for. <img src="/src/assets/emerald_brooch_icon.png" class="rounded-lg w-[20px] inline cursor-pointer" alt="Emerald Brooch" @click.prevent="emeraldBroochPaywallRef?.openDialog()" />
            </div>
        </div>
    </div>
    <EmeraldBroochPaywall ref="emeraldBroochPaywallRef" />
</template>

<script setup lang="ts">
import { ref } from "vue"
// import { useCoreStore } from '../store/core'
import EmeraldBroochPaywall from './dialogs/EmeraldBroochPaywall.vue'

// const coreStore = useCoreStore()

// const loading = ref(false)

const emeraldBroochPaywallRef = ref<typeof EmeraldBroochPaywall>()


</script>