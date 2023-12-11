import { createApp } from 'vue'
import router from "./router"
import { createPinia } from "pinia"
import { createHead } from "@vueuse/head"
import {Chains, createWeb3Auth} from '@kolirt/vue-web3-auth'
import App from './App.vue'

import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(createHead())
app.use(createWeb3Auth({
    projectId: import.meta.env.VITE_PROJECT_ID,
    chains: [
        Chains.fantom,
        // {
        //     id: Chains.fantom.id,
        //     name: 'Fantom Devnet',
        //     network: Chains.fantom.network,
        //     nativeCurrency: Chains.fantom.nativeCurrency,
        //     rpcUrls: {
        //         default: {
        //             http: [import.meta.env.VITE_TENDERLY_RPC],
        //             webSocket: [],
        //         },
        //         public: {
        //             http: [import.meta.env.VITE_TENDERLY_RPC],
        //             webSocket: [],
        //         }
        //     },
        //     blockExplorers: Chains.fantom.blockExplorers,
        //     contracts: Chains.fantom.contracts,
        // },
    ],
}))
app.use(router)

app.mount('#app')
