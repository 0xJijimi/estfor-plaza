<template>
    <select class="select select-bordered w-full select-xs" v-model="value">
        <option
            v-for="hour in Array.from({ length: 24 }, (_, i) => i + 1)"
            :key="hour"
            :value="hour"
        >
            {{ hour }} hour{{ hour > 1 ? "s" : "" }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { computed } from "vue"

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    modelValue: {
        type: Number,
        default: undefined,
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
