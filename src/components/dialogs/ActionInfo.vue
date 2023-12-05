<template>
    <dialog id="action_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary md:w-4/5 max-w-full">
            <h3 class="font-bold text-lg text-center">{{ skillName }}</h3>
            <img :src="imgSource" :alt="skillName" class="w-full mx-auto mt-5 max-w-[800px]" />

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                    <tr>
                        <th class="text-left">Action</th>
                        <th class="text-right">Level</th>
                        <th class="text-right">XP (per hour)</th>
                        <th class="text-right">Item required</th>
                        <th class="text-right">Loot (per hour)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="a in actions" :key="a.actionId">
                        <td class="text-left">{{ actionNames[a.actionId] }}</td>
                        <td class="text-right">{{ getLevel(a.info.minXP) }}</td> 
                        <td class="text-right">{{ a.info.xpPerHour }}</td> 
                        <td class="text-right">{{ itemNames[a.info.handItemTokenIdRangeMin] || 'None' }}</td> 
                        <td v-if="a.guaranteedRewards.length > 0" class="text-right"><span v-for="r in a.guaranteedRewards" :key="r.itemTokenId">{{ r.rate / 10 }}</span></td>
                        <td v-if="a.randomRewards.length > 0" class="text-right">
                            <div v-for="r in a.randomRewards" :key="r.itemTokenId" class="text-xs">
                                <span>{{ itemNames[r.itemTokenId] }} - {{ r.amount }} ({{ ((r.chance * a.info.successPercent) / 65535).toFixed(2) }}% - {{ ((r.chance * 90) / 65535).toFixed(2) }}%)</span>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { actionNames, skillNames } from '../../store/skills'
import { MEDIA_URL, getLevel } from '../../store/core'
import { itemNames } from '../../store/items'
import { allActions } from '../../data/actions';
import { Skill } from '@paintswap/estfor-definitions/types';

const skillId = ref(0)

const actions = computed(() => {
    const a = [...allActions.filter(x => x.info.skill === skillId.value)]
    a.sort((a, b) => a.info.minXP > b.info.minXP ? 1 : -1)
    return a
})

const skillName = computed(() => {
    // @ts-ignore
    return skillNames[skillId.value]
})

const imgSource = computed(() => {
    // @ts-ignore
    return `${MEDIA_URL}/landscape/${skillNames[skillId.value].toLowerCase()}.jpg`
})

const openDialog = (_skillId: Skill) => {
    skillId.value = _skillId
    const dialog = document.getElementById('action_modal') as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog
})
</script>