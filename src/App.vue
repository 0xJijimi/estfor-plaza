<script setup lang="ts">
import { onMounted, provide } from "vue"
import { useAppStore } from "./store/app"
import Header from "./components/layout/Header.vue"
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/vue"
import { fantom } from "viem/chains"
import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
} from "@apollo/client/core"
import { DefaultApolloClient } from "@vue/apollo-composable"

const appStore = useAppStore()

const setPreferredColorScheme = () => {
    appStore.setTheme("dark")
}

onMounted(() => {
    setPreferredColorScheme()
})

const projectId = import.meta.env.VITE_PROJECT_ID
const metadata = {
    name: "Deif's Estfor Plaza",
    description: "",
    url: "https://estfor.deif.eth.limo",
    icons: [],
}

const chains = [fantom]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    defaultChain: fantom,
    excludeWalletIds: [
        "19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927",
    ], // exclude ledger
    themeVariables: {
        "--w3m-accent": "#214850",
    },
})

// HTTP connection to the API
const httpLink = createHttpLink({
    // You should use an absolute URL here
    uri: import.meta.env.VITE_SUBGRAPH_URL,
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
})

provide(DefaultApolloClient, apolloClient)
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
