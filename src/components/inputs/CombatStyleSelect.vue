<template>
    <select class="select select-bordered w-full select-xs" v-model="value">
        <option v-for="o in options" :key="o.value" :value="o.value">
            {{ o.text }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { Skill } from "@paintswap/estfor-definitions/types";
import { computed } from "vue"

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
    modelValue: {
        type: Number,
        default: undefined
    },
    skill: {
      type: Number,
      default: Skill.MELEE
    },
})

const options = computed(() => [{ text: 'Attack', value: props.skill }, { text: 'Defence', value: Skill.DEFENCE }])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
</script>