<template>
    <div class="join items-center" :class="props.containerClass">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 mr-2 text-primary"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
        </svg>
        <input
            type="text"
            placeholder="Clan Search"
            class="input input-bordered bg-base-100-50"
            :class="props.inputClass"
            v-model="value"
            :list="'clan-datalist-' + randomId"
        />
        <datalist :id="'clan-datalist-' + randomId">
            <option
                v-for="name in clanStore.clanNames"
                :key="name"
                :value="name"
            />
        </datalist>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useClanStore } from "../../store/clan"

const clanStore = useClanStore()

const emit = defineEmits(["update:modelValue"])

const randomId = ref(Math.random().toString(36).substring(7))

const props = defineProps({
    modelValue: {
        type: String,
        default: null,
    },
    containerClass: {
        type: String,
        default: "justify-end",
    },
    inputClass: {
        type: String,
        default: "input-sm max-w-xs",
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
