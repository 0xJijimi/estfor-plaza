<template>
    <select
        class="select select-bordered w-full"
        :class="props.customClass"
        v-model="value"
        :disabled="props.disabled"
    >
        <option :disabled="!props.emptyEquipment" selected :value="undefined">
            {{ props.label }}
            <span v-if="props.emptyEquipment">(No Pet)</span>
        </option>
        <option v-for="(item, i) in props.items" :key="i" :value="item">
            {{ item.name }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue"
import { Pet } from "@paintswap/estfor-definitions/types"

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    items: {
        type: Array as PropType<Pet[]>,
        required: true,
    },
    label: {
        type: String,
        required: false,
        default: "",
    },
    modelValue: {
        type: Pet,
        default: undefined,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    emptyEquipment: {
        type: Boolean,
        default: true,
    },
    customClass: {
        type: String,
        default: "md:select-sm select-xs",
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
