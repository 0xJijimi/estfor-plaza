<template>
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Action</span>
        </div>
        <select class="select select-bordered w-full" v-model="value">
            <option v-for="o in options" :key="o.actionId" :value="o.actionId">
                {{ actionNames[o.actionId] || "" }}
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
import { actionNames, useSkillStore } from "../../store/skills"
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
            // @ts-ignore
            return h.playerState[skillToXPMap[props.skillId]] as number
        })
    )
})

const options = computed(() => {
    return skillStore
        .getActionInputsForSkill(props.skillId)
        .filter((s) => s.info.minXP <= minHeroXPForSkill.value)
})
</script>
