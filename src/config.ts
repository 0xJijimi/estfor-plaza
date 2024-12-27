import { injected, walletConnect } from "@wagmi/connectors"
import { http, createConfig, fallback } from "@wagmi/core"
import { fantom, sonic } from "@wagmi/core/chains"

const metadata = {
    name: "Deif's Estfor Plaza",
    description: "",
    url: "https://estfor.deif.eth.limo",
    icons: [],
}

const projectId = import.meta.env.VITE_PROJECT_ID

export const config = createConfig({
    chains: [fantom, sonic],
    transports: {
        [fantom.id]: fallback(
            [
                http("https://rpcapi.fantom.network"),
                http("https://fantom-rpc.publicnode.com"),
                http("https://rpc.fantom.network"),
                http("https://fantom.drpc.org"),
                http("https://fantom-pokt.nodies.app"),
                // http("https://fantom.blockpi.network/v1/rpc/public"),
                http("https://rpc.ankr.com/fantom"),
            ],
            { rank: { interval: 20_000 } }
        ),
        [sonic.id]: fallback(
            [
                http("https://sonic.drpc.org"),
                http("https://rpc.soniclabs.com"),
                http("https://rpc.ankr.com/sonic_mainnet"),
            ],
            { rank: { interval: 20_000 } }
        ),
    },
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
        injected({ shimDisconnect: true }),
    ],
})

export const estimateConfig = createConfig({
    chains: [fantom, sonic],
    transports: {
        [fantom.id]: http("https://rpcapi.fantom.network"),
        [sonic.id]: http("https://rpc.soniclabs.com"),
    },
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
        injected({ shimDisconnect: true }),
    ],
})
