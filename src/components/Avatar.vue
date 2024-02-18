<template>
    <div class="flex items-center justify-center flex-col">
        <div
            class="border-2 bg-base-100-50 border-solid rounded-lg border-primary w-full text-center p-5 my-5"
        >
            {{ props.name }}
        </div>
        <img
            :src="avatarSrc"
            class="rounded-lg border-solid border-2 border-primary"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false,
        default: "",
    },
})

const avatarSrc = computed(() => {
    return `https://media.estfor.com/characters/${props.id}.jpg`
})
</script>

<style scoped>
img {
    object-fit: contain;
    height: auto;
    width: 100%;
}
</style>
