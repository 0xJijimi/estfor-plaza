<template>
    <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 my-10">
        <div v-for="action in allActions" :key="action.skill" class="card bg-base-100-50 shadow-xl rounded-lg">
            <figure><img class="w-full" :src="`${MEDIA_URL}/landscape/${skillNames[action.skill]?.toLowerCase()}.jpg`" :alt="skillNames[action.skill]" /></figure>
            <div class="card-body">
                <div class="grid grid-cols-2 gap-2">
                    <div class="flex-col flex justify-between">
                        <div class="flex flex-col">
                            <div class="text-2xl font-bold">{{ skillNames[action.skill] || 'Unknown' }}</div>
                            <div class="text-sm text-gray-400">{{ action.relevantAction.currentAction.name || 'Unknown' }}</div>
                        </div>
                        <div class="flex flex-col mt-5">
                            <div class="text-2xl font-bold">{{ action.relevantAction.currentAction.xpPerHour }} XP/hour</div>
                            <div class="text-sm text-gray-400">Current action</div>
                        </div>
                    </div>
                    <div class="flex-col flex justify-between">
                        <div class="flex flex-col">
                            <div class="text-2xl font-bold">{{ hoursUntilNextAction(action.relevantAction) }} hour{{ hoursUntilNextAction(action.relevantAction) > 1 ? 's' : '' }}</div>
                            <div class="text-sm text-gray-400">Until next action unlock</div>
                        </div>
                        <div v-if="action.relevantAction.nextAction" class="flex flex-col mt-5">
                            <div class="text-2xl font-bold">{{ action.relevantAction.nextAction?.xpPerHour }} XP/hour</div>
                            <div class="text-sm text-gray-400">Next action</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Skill } from '@paintswap/estfor-definitions/types'
import { useSkillStore, RelevantAction, skillNames } from '../store/skills'
import { MEDIA_URL } from '../store/core'
import { computed } from 'vue'

const skillStore = useSkillStore()

const allActions = computed(() => {
    return [
        { skill: Skill.WOODCUTTING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.WOODCUTTING) },
        { skill: Skill.MINING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.MINING) },
        { skill: Skill.FISHING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FISHING) },
        { skill: Skill.COOKING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.COOKING) },
        { skill: Skill.SMITHING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.SMITHING) },
        { skill: Skill.CRAFTING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.CRAFTING) },
        { skill: Skill.FIREMAKING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FIREMAKING) },
        { skill: Skill.THIEVING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.THIEVING) },
        { skill: Skill.FORGING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FORGING) },
        { skill: Skill.FLETCHING, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FLETCHING) },
        { skill: Skill.ALCHEMY, relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.ALCHEMY) },
    ]
});


const hoursUntilNextAction = (relevantAction: RelevantAction) => {
    if (!relevantAction.nextAction) {
        return 0 // max level
    }
    const xpToNextAction = relevantAction.nextAction.minXP - relevantAction.currentXPForSkill
    return Math.ceil(xpToNextAction / relevantAction.currentAction.xpPerHour)
}
</script>