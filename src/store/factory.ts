import {
    getAccount,
    multicall,
    waitForTransaction,
    writeContract,
} from "@wagmi/core"
import { Player, QueuedAction } from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"
import { ZeroAddress, solidityPacked, Interface } from "ethers"
import { fantom } from "viem/chains"

import { Address, useCoreStore } from "./core"

import estforPlayerAbi from "../abi/estforPlayer.json"
import estforPlayerNFTAbi from "../abi/estforPlayerNFT.json"
import factoryAbi from "../abi/factoryRegistry.json"
import epProxyAbi from "../abi/epProxy.json"
import { getPlayersByIds } from "../utils/api"

export interface SavedTransaction {
    to: string
    data: any
}

export interface ProxySilo {
    address: string
    owner: string
    index: number
    playerId: string
    playerState: Player
    isPaused: boolean
    savedTransactions: SavedTransaction[]
    queuedActions: QueuedAction[]
}

export interface FactoryState {
    proxys: ProxySilo[]
    initialised: boolean
    initialisedAt: Date | null
}

export const useFactoryStore = defineStore({
    id: "factory",
    state: () =>
        ({
            proxys: [] as ProxySilo[],
            initialised: false,
            initialisedAt: null,
        }) as FactoryState,
    getters: {
        emptyProxys(state: FactoryState) {
            return state.proxys.filter((p) => p.playerId === "")
        },
        unassignedProxys(state: FactoryState) {
            return state.proxys.filter(
                (p) => p.playerId !== "" && p.savedTransactions.length === 0
            )
        },
    },
    actions: {
        async mintHeroes(heroes: any[]) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT
            )
            const account = getAccount()
            if (!factoryAddress || !playerNFTAddress || !account.isConnected) {
                return
            }

            const factoryInterface = new Interface(factoryAbi)
            const playerNFTInterface = new Interface(estforPlayerNFTAbi)
            const emptyProxies = this.proxys.filter((p) => p.playerId === "")
            if (emptyProxies.length < heroes.length) {
                return
            }

            const selectorArray = heroes.map((h, i) =>
                solidityPacked(
                    ["bytes"],
                    [
                        factoryInterface.encodeFunctionData("execute", [
                            emptyProxies[i].address,
                            playerNFTAddress,
                            playerNFTInterface.encodeFunctionData("mint", [
                                h.avatarId,
                                h.name,
                                "",
                                "",
                                "",
                                false,
                                true,
                            ]),
                        ]),
                    ]
                )
            )
            const tx = await writeContract({
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "multicall",
                args: [selectorArray],
            })
            await waitForTransaction({ hash: tx.hash })

            await this.getAllProxyStates()
        },
        async getAllProxyStates() {
            const coreStore = useCoreStore()
            const playerAddress = coreStore.getAddress(Address.estforPlayers)
            const account = getAccount()
            if (!playerAddress || !account.isConnected) {
                return
            }

            const proxyContract = {
                abi: epProxyAbi,
                chainId: fantom.id,
            }

            const data = await multicall({
                contracts: this.proxys.map((p) => ({
                    address: playerAddress as `0x${string}`,
                    abi: estforPlayerAbi,
                    functionName: "activePlayer",
                    args: [p.address],
                })) as any,
            })

            const proxysWithPlayerId = this.proxys.map((p, i) => ({
                ...p,
                playerId:
                    data[i].result !== BigInt(0)
                        ? data[i].result?.toString() || ""
                        : "",
            }))

            const playerIdsToGet = proxysWithPlayerId
                .filter((p) => p.playerId !== "")
                .map((p) => p.playerId)
            if (playerIdsToGet.length > 0) {
                const playerStateResults = await getPlayersByIds(playerIdsToGet)

                const proxyData = await multicall({
                    contracts: proxysWithPlayerId.map(
                        (p) =>
                            ({
                                ...proxyContract,
                                address: p.address,
                                functionName: "getAllSavedTransactions",
                                args: [],
                            }) as any
                    ),
                })

                const proxyPauseData = await multicall({
                    contracts: proxysWithPlayerId.map(
                        (p) =>
                            ({
                                ...proxyContract,
                                address: p.address,
                                functionName: "isPaused",
                                args: [],
                            }) as any
                    ),
                })

                this.proxys = proxysWithPlayerId.map((p, i) => ({
                    ...p,
                    playerState:
                        playerStateResults.players.find(
                            (ps) => ps.id === p.playerId
                        ) || ({} as Player),
                    savedTransactions: proxyData[i]
                        .result as SavedTransaction[],
                    isPaused: proxyPauseData[i].result as boolean,
                }))
            }
        },
        async createProxy(proxyNumber: number) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount()
            if (!factoryAddress || !account.isConnected) {
                return
            }

            const data = new Interface(factoryAbi).encodeFunctionData(
                "createProxy",
                []
            )
            const selectorArray = Array.from({ length: proxyNumber }, () =>
                solidityPacked(["bytes"], [data])
            )

            const tx = await writeContract({
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "multicall",
                args: [selectorArray],
            })
            await waitForTransaction({ hash: tx.hash })

            this.getProxys(true)
        },
        async getProxys(force = true) {
            if (
                !force &&
                this.initialised &&
                this.initialisedAt &&
                new Date().getTime() - this.initialisedAt.getTime() <
                    1000 * 60 * 10
            ) {
                return
            }

            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount()
            if (!factoryAddress || !account.isConnected) {
                return
            }

            const factoryContract = {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                chainId: fantom.id,
            }

            let moreProxys = true
            let currentIndex = this.proxys.length
            while (moreProxys) {
                const data = await multicall({
                    contracts: Array.from(
                        { length: 10 },
                        (_, i) =>
                            ({
                                ...factoryContract,
                                functionName: "proxyAddressOfOwnerByIndex",
                                args: [account.address, i + currentIndex],
                            }) as any
                    ),
                })
                currentIndex += 10

                moreProxys = !data.some((d) => d.result === ZeroAddress)
                this.proxys.push(
                    ...data
                        .filter((d) => d.result !== ZeroAddress)
                        .map((d, i) => ({
                            address: d.result as string,
                            index: i + currentIndex,
                            playerId: "",
                            playerState: {} as Player,
                            queuedActions: [] as QueuedAction[],
                            owner: account.address as string,
                            isPaused: true,
                            savedTransactions: [] as SavedTransaction[],
                        }))
                )
            }

            this.initialised = true
            this.initialisedAt = new Date()
        },
    },
})
