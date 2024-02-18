<template>
    <select
        class="select select-bordered w-full md:select-md select-xs"
        v-model="value"
        :disabled="props.disabled"
    >
        <option :disabled="!props.emptyEquipment" selected :value="undefined">
            {{ props.label }}
            <span v-if="props.emptyEquipment">(No Equipment)</span>
        </option>
        <option
            v-for="item in props.items"
            :key="item.tokenId"
            :value="item.tokenId"
        >
            {{ item.name }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue"
import { ItemInput } from "@paintswap/estfor-definitions/types"

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    items: {
        type: Array as PropType<ItemInput[] | any[]>,
        required: true,
    },
    label: {
        type: String,
        required: false,
        default: "",
    },
    modelValue: {
        type: Number,
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
