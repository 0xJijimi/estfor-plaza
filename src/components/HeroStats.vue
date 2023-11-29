<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg">
        <div class="card-body">
            <div class="overflow-x-auto">
                <table class="table md:table-md table-xs">
                    <!-- head -->
                    <thead>
                    <tr>
                        <th class="w-20"></th>
                        <th class="text-right"><div class="tooltip tooltip-primary tooltip-bottom w-full" data-tip="Melee"><img src="/src/assets/melee.png" class="mask mask-squircle md:w-10 w-6 mx-auto" alt="Melee" /></div></th>
                        <th class="text-right"><div class="tooltip tooltip-primary tooltip-bottom w-full" data-tip="Ranged"><img src="/src/assets/ranged.png" class="mask mask-squircle md:w-10 w-6 mx-auto" alt="Ranged" /></div></th>
                        <th class="text-right"><div class="tooltip tooltip-primary tooltip-bottom w-full" data-tip="Magic"><img src="/src/assets/magic.png" class="mask mask-squircle md:w-10 w-6 mx-auto" alt="Magic" /></div></th>
                        <th class="text-right"><div class="tooltip tooltip-primary tooltip-bottom w-full" data-tip="Melee Defence"><img src="/src/assets/melee_def.png" class="mask mask-squircle md:w-10 w-6 mx-auto" alt="Melee Defence" /></div></th>                        
                        <th class="text-right"><div class="tooltip tooltip-primary tooltip-bottom w-full" data-tip="Ranged Defence"><img src="/src/assets/ranged_def.png" class="mask mask-squircle md:w-10 w-6 mx-auto" alt="Ranged Defence" /></div></th>
                        <th class="text-right"><div class="tooltip tooltip-primary tooltip-bottom w-full" data-tip="Magic Defence"><img src="/src/assets/magic_def.png" class="mask mask-squircle md:w-10 w-6 mx-auto" alt="Magic Defence" /></div></th>
                        <th class="text-right"><div class="tooltip tooltip-primary tooltip-bottom w-full" data-tip="Health"><img src="/src/assets/health.png" class="mask mask-squircle md:w-10 w-6 mx-auto" alt="Health" /></div></th>
                    </tr>
                    </thead>
                    <tbody>
                    <!-- row 1 -->
                    <tr>
                        <th>Hero</th>
                        <td class="text-center">{{ getLevel(coreStore.playerState?.meleeXP) }}</td>                        
                        <td class="text-center">{{ getLevel(coreStore.playerState?.rangedXP) }}</td>
                        <td class="text-center">{{ getLevel(coreStore.playerState?.magicXP) }}</td>
                        <td class="text-center">{{ getLevel(coreStore.playerState?.defenceXP) }}</td>
                        <td class="text-center">{{ getLevel(coreStore.playerState?.defenceXP) }}</td>
                        <td class="text-center">{{ getLevel(coreStore.playerState?.defenceXP) }}</td>
                        <td class="text-center">{{ getLevel(coreStore.playerState?.healthXP) }}</td>
                    </tr>
                    <!-- row 2 -->
                    <tr>
                        <th>Equipment</th>
                        <td class="text-center" :class="{'text-error': itemStore.getAggregatedCombatStats.melee < 0}">{{ itemStore.getAggregatedCombatStats.melee }}</td>                        
                        <td class="text-center" :class="{'text-error': itemStore.getAggregatedCombatStats.ranged < 0}">{{ itemStore.getAggregatedCombatStats.ranged }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getAggregatedCombatStats.magic < 0}">{{ itemStore.getAggregatedCombatStats.magic }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getAggregatedCombatStats.meleeDefence < 0}">{{ itemStore.getAggregatedCombatStats.meleeDefence }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getAggregatedCombatStats.rangedDefence < 0}">{{ itemStore.getAggregatedCombatStats.rangedDefence }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getAggregatedCombatStats.magicDefence < 0}">{{ itemStore.getAggregatedCombatStats.magicDefence }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getAggregatedCombatStats.health < 0}">{{ itemStore.getAggregatedCombatStats.health }}</td>
                    </tr>
                    <!-- row 3 -->
                    <tr>
                        <th>Total</th>
                        <td class="text-center" :class="{'text-error': itemStore.getTotalCombatStats.melee < 0}">{{ itemStore.getTotalCombatStats.melee }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getTotalCombatStats.ranged < 0}">{{ itemStore.getTotalCombatStats.ranged }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getTotalCombatStats.magic < 0}">{{ itemStore.getTotalCombatStats.magic }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getTotalCombatStats.meleeDefence < 0}">{{ itemStore.getTotalCombatStats.meleeDefence }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getTotalCombatStats.rangedDefence < 0}">{{ itemStore.getTotalCombatStats.rangedDefence }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getTotalCombatStats.magicDefence < 0}">{{ itemStore.getTotalCombatStats.magicDefence }}</td>
                        <td class="text-center" :class="{'text-error': itemStore.getTotalCombatStats.health < 0}">{{ itemStore.getTotalCombatStats.health }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useItemStore } from '../store/items'
import { useCoreStore, getLevel } from '../store/core'

const itemStore = useItemStore()
const coreStore = useCoreStore()
</script>

<style scoped>
.table {
    table-layout: fixed;
}
</style>