import { injected, walletConnect } from "@wagmi/connectors"
import { http, createConfig, fallback } from "@wagmi/core"
import { sonic } from "@wagmi/core/chains"

const metadata = {
    name: "Deif's Estfor Plaza",
    description: "",
    url: "https://hmmdeif.github.io/estfor-plaza/",
    icons: [],
}

const projectId = import.meta.env.VITE_PROJECT_ID

export const config = createConfig({
    chains: [sonic],
    transports: {
        [sonic.id]: fallback(
            [
                http("https://sonic.drpc.org"),
                http("https://rpc.soniclabs.com"),
                http("https://sonic-rpc.publicnode.com"),
            ],
            { rank: { interval: 120_000 } }
        ),
    },
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
        injected({ shimDisconnect: true }),
    ],
})

export const estimateConfig = createConfig({
    chains: [sonic],
    transports: {
        [sonic.id]: http("https://rpc.soniclabs.com"),
    },
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
        injected({ shimDisconnect: true }),
    ],
})
