<script setup lang="ts">
import { onMounted } from "vue"
import { useAppStore } from "./store/app"
import Header from "./components/layout/Header.vue"

const appStore = useAppStore()

const setPreferredColorScheme = () => {
    appStore.setTheme("dark")
    // if (appStore.theme === "notheme") {
    //     if (
    //         "matchMedia" in window &&
    //         window.matchMedia("(prefers-color-scheme: dark)").matches
    //     ) {
    //         appStore.setTheme("dark")
    //     } else {
    //         appStore.setTheme("light")
    //     }
    // }
}

onMounted(() => {
    setPreferredColorScheme()
})
</script>

<template>
    <div class="app overflow-y-auto">
        <Header />
        <RouterView />
    </div>
</template>

<style>
.app {
    position: fixed;
    height: 100%;
    width: 100%;
    background-image: url("https://media.estfor.com/landscape/mining2.jpg");
    background-position: center;
    background-size: cover;
}
</style>