<template>
    <select class="select select-bordered" v-model="value">
        <option v-for="o in options" :key="o.value" :value="o.value">
            {{ o.text }}
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

const options = computed(() => [
    { text: "Last 7 Days", value: 7 },
    { text: "Last 14 Days", value: 14 },
    { text: "Last 30 Days", value: 30 },
])

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit("update:modelValue", value)
    },
})
</script>
