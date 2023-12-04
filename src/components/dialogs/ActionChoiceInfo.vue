<template>
    <dialog id="action_choice_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary md:w-4/5 max-w-full">
            <h3 class="font-bold text-lg text-center">{{ skillName }}</h3>
            <img :src="imgSource" :alt="skillName" class="w-full mx-auto mt-5 max-w-[800px]" />

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                    <tr>
                        <th class="text-left">Item</th>
                        <th class="text-right">Level</th>
                        <th class="text-right">XP (per hour)</th>
                        <th class="text-right">Inputs</th>
                        <th class="text-right">Input Amounts</th>
                        <th class="text-right">Output (per hour)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(a, i) in actions" :key="i">
                        <td class="text-left">{{ itemNames[a.outputTokenId] }}</td>
                        <td class="text-right">{{ getLevel(a.minXPs[a.minSkills.findIndex(s => s === skillId) || 0] || 0) }}</td> 
                        <td class="text-right">{{ a.xpPerHour }}</td> 
                        <td class="text-right">
                            <div v-for="x in a.inputTokenIds" :key="x">{{ itemNames[x] }}</div>
                        </td> 
                        <td class="text-right">
                            <div v-for="x in a.inputAmounts" :key="x">{{ x * a.rate / 1000 }}</div>
                        </td> 
                        <td class="text-right">
                            <span v-if="a.successPercent < 100">{{ (a.outputAmount * a.rate / 1000 * a.successPercent / 100).toFixed(1) }} - {{ (a.outputAmount * a.rate / 1000 * 90 / 100).toFixed(1) }}</span>
                            <span v-else>{{ a.outputAmount * a.rate / 1000 }}</span>
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
import { skillNames, useSkillStore } from '../../store/skills'
import { MEDIA_URL, getLevel } from '../../store/core'
import { itemNames } from '../../store/items'
import { ActionChoiceInput, Skill } from '@paintswap/estfor-definitions/types'

const skillId = ref(0)
const skillStore = useSkillStore()

const actions = computed(() => {
    let a: ActionChoiceInput[] = []
    switch (skillId.value) {
        case Skill.COOKING:
            a = skillStore.cooking
            break
        case Skill.CRAFTING:
            a = skillStore.crafting
            break
        case Skill.SMITHING:
            a = skillStore.smithing
            break
        case Skill.FIREMAKING:
            a = skillStore.firemaking
            break
        case Skill.ALCHEMY:
            a = skillStore.alchemy
            break
        case Skill.FORGING:
            a = skillStore.forging
            break
        case Skill.FLETCHING:
            a = skillStore.fletching
            break
        default:
            return []
    }
    a.sort((a, b) => {
        if ((a.minXPs[a.minSkills.findIndex(s => s === skillId.value)] || 0) > (b.minXPs[b.minSkills.findIndex(s => s === skillId.value)] || 0))
            return 1
        if ((a.minXPs[a.minSkills.findIndex(s => s === skillId.value)] || 0) < (b.minXPs[b.minSkills.findIndex(s => s === skillId.value)] || 0))
            return -1
        return 0
    })
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
    const dialog = document.getElementById('action_choice_modal') as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog
})
</script>