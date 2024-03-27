<template>
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Queue Type</span>
        </div>
        <select class="select select-bordered w-full" v-model="value">
            <option v-for="o in options" :key="o" :value="o">
                {{ actionQueueStatusNames[o] || "" }}
            </option>
        </select>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { ActionQueueStatus } from "@paintswap/estfor-definitions/types"

const emit = defineEmits(["update:modelValue"])

const actionQueueStatusNames = {
    [ActionQueueStatus.APPEND]: "Append",
    [ActionQueueStatus.KEEP_LAST_IN_PROGRESS]: "Keep Last In Progress",
    [ActionQueueStatus.NONE]: "Replace",
}

const options = [
    // ActionQueueStatus.APPEND, // think this was deprecated for KEEP_LAST_IN_PROGRESS
    ActionQueueStatus.KEEP_LAST_IN_PROGRESS,
    ActionQueueStatus.NONE,
]

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
