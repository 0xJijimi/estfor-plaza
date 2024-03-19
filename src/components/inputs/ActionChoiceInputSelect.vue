<template>
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Action</span>
        </div>
        <select class="select select-bordered w-full" v-model="value">
            <option v-for="o in options" :key="o" :value="o">
                {{ actionChoiceNames[o] || "" }}
            </option>
        </select>
        <div class="label">
            <span class="label-text"
                >Minimum level of selected heroes:
                {{ getLevel(minHeroXPForSkill.toString()) }}
            </span>
        </div>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { actionChoiceNames, useSkillStore } from "../../store/skills"
import { ProxySilo } from "../../store/factory"
import { getLevel, skillToXPMap } from "../../store/core"

const skillStore = useSkillStore()

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    modelValue: {
        type: Number,
        default: undefined,
    },
    skillId: {
        type: Number,
        required: true,
    },
    heroes: {
        type: Array as () => ProxySilo[],
        required: true,
    },
})

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit("update:modelValue", value)
    },
})

const minHeroXPForSkill = computed(() => {
    return Math.min(
        ...props.heroes.map((h) => {
            const relevantActions = h.queuedActions.filter(
                (x) => x.skill == props.skillId
            )
            let extraXP = 0
            const timenow = Date.now() / 1000
            for (const action of relevantActions) {
                const a = skillStore
                    .getActionChoiceInputsForSkill(props.skillId)
                    .find((s) => s === Number(action.choice.id))
                if (!a) {
                    continue
                }
                if (parseInt(action.startTime) < timenow) {
                    const timeNotInAction =
                        timenow - parseInt(action.startTime) - action.timespan
                    extraXP +=
                        action.choice.xpPerHour *
                        ((action.timespan - timeNotInAction) / 60 / 60)
                }
            }

            // @ts-ignore
            return Number(h.playerState[skillToXPMap[props.skillId]]) + extraXP
        })
    )
})

const options = computed(() => {
    return skillStore
        .getActionChoiceInputsForSkill(props.skillId)
        .filter((_, i) => {
            const action = skillStore.getActionChoicesForSkill(props.skillId)[i]
            return (
                action.minXPs.length === 0 ||
                action.minXPs[action.minSkills.indexOf(props.skillId)] <=
                    minHeroXPForSkill.value
            )
        })
})
</script>
