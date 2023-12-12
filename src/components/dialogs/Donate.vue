<template>
    <dialog id="donate_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">Hey, enjoying the plaza?</h3>
            <p v-if="balance < 1" class="my-5">This information doesn't come free you know, I have eggs to incubate and fires to upkeep! Now why don't you buy one of my Emerald brooches and I'll stop pestering you, what do you say? It'll get you access to better information in the future...</p>
            <p v-if="balance < 1" class="my-5">It's better to buy them early because I increase the price after each one sold!</p>
            <p v-if="balance >= 1" class="my-5">Oh, you already have {{ balance }} of my brooches... would you like another one perchance?</p>
            <img src="/src/assets/emerald_brooch_web.png" class="rounded-lg" alt="Emerald Brooch" />
            <button type="button" class="btn btn-primary btn-lg w-full mt-5" :disabled="loading" @click.prevent="mintNFT">Mint Emerald Brooch ({{ mintPrice }} FTM)</button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { HOMEMADE_BROOCH_ADDRESS } from '../../utils/addresses'
import { account, readContract, writeContract } from '@kolirt/vue-web3-auth'
import broochAbi from '../../abi/brooch.json'
import { solidityPacked } from 'ethers'
import { useAppStore } from '../../store/app'

const app = useAppStore()

const loading = ref(false)
const totalSupply = ref(0)
const baseTokenPrice = ref(0)
const balance = ref(0)

const init = async () => {
    try {
        if (account.connected) {
            loading.value = true
            const result = await Promise.all([
                readContract({
                    address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                    abi: broochAbi,
                    functionName: 'tokenSupply',
                    args: [0],
                }),
                readContract({
                    address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                    abi: broochAbi,
                    functionName: 'baseTokenPrice',
                    args: [0],
                }),
                readContract({
                    address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                    abi: broochAbi,
                    functionName: 'balanceOf',
                    args: [account.address, 0],
                }),
            ])
            totalSupply.value = result[0] as unknown as number
            baseTokenPrice.value = result[1] as unknown as number
            balance.value = result[2] as unknown as number
        }
    }
    finally {
        loading.value = false
    }
}

const openDialog = (_monsterId: number) => {
    const dialog = document.getElementById('donate_modal') as HTMLDialogElement
    dialog.showModal()
    init()
}

const mintPrice = computed(() => {
    return ((BigInt(totalSupply.value) * BigInt(10 ** 18)) + BigInt(baseTokenPrice.value)) / BigInt(10 ** 18)
})

const mintNFT = async () => {
    loading.value = true
    try {
        const data = await writeContract({
            address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
            abi: broochAbi,
            functionName: 'mintBatch',
            args: [account.address, [0], [1], solidityPacked(['bytes'], ['0x'])],
            value: (BigInt(totalSupply.value) * BigInt(10 ** 18)) + BigInt(baseTokenPrice.value),
            
        })
        await data?.wait()
        app.addToast('Thank you for your support!', 'alert-success', 5000)
    } catch (error) {  
        // app.addToast('Failed to mint brooch', 'alert-error', 50000)      
        console.log(error)
    } finally {
        loading.value = false
        const dialog = document.getElementById('donate_modal') as HTMLDialogElement
        dialog.close()
        init()
    }
}

watch(account, init)

onMounted(init)

defineExpose({
    openDialog
})
</script>