<template>
    <select class="select select-bordered w-full" v-model="value">
        <option v-for="o in options as any[]" :key="o.id" :value="o.id">
            {{ avatarIdToBoost(o.boostSkills) }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { skillNames } from "../../store/skills"

const emit = defineEmits(["update:modelValue"])

const avatarIdToBoost = (boostSkills: number[]) => {
    if (boostSkills.length > 1) {
        return `+5% ${(skillNames as any)[boostSkills[0]]} +5% ${
            (skillNames as any)[boostSkills[1]]
        }`
    }
    return `+10% ${(skillNames as any)[boostSkills[0]]}`
}

const props = defineProps({
    modelValue: {
        type: Number,
        default: undefined,
    },
    options: {
        type: Array,
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
</script>
