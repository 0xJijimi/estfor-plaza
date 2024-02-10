
<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto md:w-[760px]">
        <div class="card-body">
            <div role="tablist" class="tabs tabs-bordered tabs-lg mb-4">        
                <router-link to="/territory-rankings" role="tab" class="tab">Territory Rankings</router-link>
                <div role="tab" class="tab tab-active">Vault Rankings</div>
            </div>            
            <div class="form-control items-end">
                <label class="label cursor-pointer">
                    <span class="label-text mr-2 items-center flex">
                        Use Sharpened Claw (+1 to max points for VAULT attacker)
                    </span> 
                    <input type="checkbox" class="checkbox checkbox-primary" v-model="addOneMaxPoint" @update:model-value="init" />
                </label>
            </div>
            <div class="overflow-x-auto">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th>Owner</th>
                            <th class="text-right">Locked Amount</th>
                            <th class="text-right">Chance to Win</th>
                        </tr>
                    </thead>

                    <tbody v-if="loading" class="mx-auto my-[100px] w-full text-center">
                        <tr><td colspan="3"><span class="loading loading-spinner text-primary loading-md mx-auto"></span></td></tr>
                    </tbody>
                    <tbody v-else>
                        <tr v-for="clan in sortedVaults" :key="clan.id" :class="{'text-success': clan.name == coreStore.clanState?.name}">
                            <td>{{ clan.name }}</td>
                            <td class="text-right">{{ BigInt(clan.total) / BigInt(10**18) }}</td>
                            <td class="text-right">{{ clan.name == coreStore.clanState?.name ? '-' : clan.chanceToWin ? `${clan.chanceToWin}%` : 'You are not in a clan' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="text-xs text-center text-warning">N.B. This page may take a small time to load whilst it calculates the chance to win</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useClanStore, calculateBattleChances } from '../store/clan'
import { useCoreStore } from '../store/core';

const clanStore = useClanStore()
const coreStore = useCoreStore()
const sortedVaults = ref<any[]>([])
const addOneMaxPoint = ref(false)

const attackerVaultCombatants = computed(() => {
    return coreStore.clanState?.lockedVaultCombatants || []
})

const loading = ref(false)

const init = async () => {
    loading.value = true
    try {
        await clanStore.getAllClanInfo()

        sortedVaults.value = [...clanStore.sortedVaults]
        if (attackerVaultCombatants.value.length > 0) {
            for (const v of sortedVaults.value) {
                v.chanceToWin = calculateBattleChances(500, attackerVaultCombatants.value, v.combatants, addOneMaxPoint.value, 'Vault').clanA
            }
        } else {
            for (const v of sortedVaults.value) {
                v.chanceToWin = null
            }
        }
    } finally {
        loading.value = false
    }
}

onMounted(init)
</script>

