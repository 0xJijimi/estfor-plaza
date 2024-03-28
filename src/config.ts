import { injected, walletConnect } from "@wagmi/connectors"
import { http, createConfig } from "@wagmi/core"
import { fantom } from "@wagmi/core/chains"

const metadata = {
    name: "Deif's Estfor Plaza",
    description: "",
    url: "https://estfor.deif.eth.limo",
    icons: [],
}

const projectId = import.meta.env.VITE_PROJECT_ID

export const config = createConfig({
    chains: [fantom],
    transports: {
        [fantom.id]: http(),
    },
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
        injected({ shimDisconnect: true }),
    ],
})
