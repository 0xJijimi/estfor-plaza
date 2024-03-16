import {
    getAccount,
    multicall,
    readContract,
    waitForTransaction,
    writeContract,
} from "@wagmi/core"
import {
    ActionQueueStatus,
    CombatStyle,
    GuaranteedReward,
    Player,
    QueuedAction,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"
import { ZeroAddress, solidityPacked, Interface } from "ethers"
import { fantom } from "viem/chains"

import { Address, skillToXPMap, useCoreStore } from "./core"

import estforPlayerAbi from "../abi/estforPlayer.json"
import itemNFTAbi from "../abi/itemNFT.json"
import estforPlayerNFTAbi from "../abi/estforPlayerNFT.json"
import factoryAbi from "../abi/factoryRegistry.json"
import epProxyAbi from "../abi/epProxy.json"
import {
    getPlayersByIds,
    searchQueuedActions,
} from "../utils/api"
import { decode } from "../utils/abi"
import { allActions } from "../data/actions"
import { calculateChance } from "../utils/player"

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

export interface AggregatedItem {
    rate: number
    amount: string
    tokenId: number
}

export const getIncomingItems = (proxys: ProxySilo[]) => {
    const items: GuaranteedReward[] = []
    for (const s of proxys) {
        const decoded = decode(
            s.savedTransactions[0].data,
            "startActions",
            estforPlayerAbi
        )
        const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
        const action = allActions.find((a) => a.actionId === Number(actionId))
        if (action) {
            for (const i of action.guaranteedRewards) {
                const existing = items.find(
                    (x) => x.itemTokenId === i.itemTokenId
                )
                if (existing) {
                    existing.rate += i.rate / 10
                } else {
                    items.push({ ...i, rate: i.rate / 10 })
                }
            }
            for (const i of action.randomRewards) {
                const existing = items.find(
                    (x) => x.itemTokenId === i.itemTokenId
                )
                if (existing) {
                    
                    existing.rate +=
                        (calculateChance(
                            i,
                            action,
                            // @ts-ignore
                            s.playerState[skillToXPMap[action.info.skill]] 
                        ) /
                            100) *
                        i.amount
                } else {
                    items.push({
                        ...i,
                        rate:
                            (calculateChance(
                                i,
                                action,
                                // @ts-ignore
                                s.playerState[skillToXPMap[action.info.skill]]
                            ) /
                                100) *
                            i.amount,
                    })
                }
            }
        }
    }
    return items
}

const constructQueuedActions = (
    actionId: number,
    rightHand: number | undefined
): any[] => {
    return [
        [
            [
                0, // head
                0, // neck
                0, // body
                0, // arms
                0, // legs
                0, // feet
                0, // ring
                0, // reserved1
            ],
            actionId,
            0, // food
            0, // melee / ranged / magic
            rightHand || 0, // weapon or tool
            0, // shield
            60 * 60 * 24, // 24 hours
            CombatStyle.NONE, // NONE / ATTACK / DEFENCE
        ],
    ]
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
        assignedProxys(state: FactoryState) {
            return state.proxys.filter(
                (p) => p.playerId !== "" && p.savedTransactions.length > 0
            )
        },
        bank(state: FactoryState) {
            // get the lowest id from this.proxys
            const ids = state.proxys.map((p) => p.index)
            ids.sort()

            return state.proxys.find((p) => p.index === ids[0])
        },
    },
    actions: {
        async mintHeroes(heroes: any[], chunks: number) {
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
                throw new Error("Not enough empty proxies")
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

            const splits = Math.ceil(heroes.length / chunks)
            for (let i = 0; i < splits; i++) {
                const tx = await writeContract({
                    address: factoryAddress as `0x${string}`,
                    abi: factoryAbi,
                    functionName: "multicall",
                    args: [selectorArray.slice(i * chunks, (i + 1) * chunks)],
                })
                await waitForTransaction({ hash: tx.hash })
            }

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
                const playerStateResults: Player[] = []
                // call getPlayersByIds in 100 player chunks
                for (let i = 0; i < playerIdsToGet.length; i += 100) {
                    const chunk = playerIdsToGet.slice(i, i + 100)
                    const result = await getPlayersByIds(chunk)
                    playerStateResults.push(...result.players)
                }
                const queuedActionPromises = await Promise.all(
                    playerIdsToGet.map((id) => searchQueuedActions(id))
                )

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
                        playerStateResults.find((ps) => ps.id === p.playerId) ||
                        ({} as Player),
                    queuedActions: queuedActionPromises
                        .filter((x) =>
                            x.queuedActions.find(
                                (q) => q.playerId === p.playerId
                            )
                        )
                        .map((x) => x.queuedActions)
                        .flat(),
                    savedTransactions: proxyData[i]
                        .result as SavedTransaction[],
                    isPaused: proxyPauseData[i].result as boolean,
                }))
            }
        },
        async createProxy(proxyNumber: number, chunks: number) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount()
            if (!factoryAddress || !account.isConnected) {
                return
            }

            proxyNumber = Math.floor(proxyNumber)
            const data = new Interface(factoryAbi).encodeFunctionData(
                "createProxy",
                []
            )
            const selectorArray = Array.from({ length: proxyNumber }, () =>
                solidityPacked(["bytes"], [data])
            )

            const factoryContract = {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                chainId: fantom.id,
            }

            const splits = Math.ceil(proxyNumber / chunks)
            for (let i = 0; i < splits; i++) {
                const tx = await writeContract({
                    ...factoryContract,
                    functionName: "multicall",
                    args: [selectorArray.slice(i * chunks, (i + 1) * chunks)],
                })
                await waitForTransaction({ hash: tx.hash })
            }
        },
        async setProxys(proxys: any[]) {
            const account = getAccount()

            this.proxys = proxys.map((d) => ({
                address: d.proxy,
                index: d.proxyId,
                playerId: "",
                playerState: {} as Player,
                queuedActions: [] as QueuedAction[],
                owner: account.address as string,
                isPaused: true,
                savedTransactions: [] as SavedTransaction[],
            }))
        },
        setQueuedActions(proxy: string, queuedActions: QueuedAction[]) {
            const proxyToUpdate = this.proxys.find((p) => p.address === proxy)
            if (proxyToUpdate) {
                proxyToUpdate.queuedActions = queuedActions
            }
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

            const totalAddressCount: bigint = (await readContract({
                ...factoryContract,
                functionName: "totalAddressCount",
                args: [],
            })) as bigint

            const data = await multicall({
                contracts: Array.from(
                    { length: Number(totalAddressCount) },
                    (_, i) =>
                        ({
                            ...factoryContract,
                            functionName: "proxyAddressOfOwnerByIndex",
                            args: [account.address, i],
                        }) as any
                ),
            })
            this.proxys.push(
                ...data
                    .map((d, i) => ({
                        address: d.result as string,
                        index: i,
                        playerId: "",
                        playerState: {} as Player,
                        queuedActions: [] as QueuedAction[],
                        owner: account.address as string,
                        isPaused: true,
                        savedTransactions: [] as SavedTransaction[],
                    }))
                    .filter((d: any) => d.address !== ZeroAddress)
            )

            this.initialised = true
            this.initialisedAt = new Date()
        },
        async assignActionToProxy(
            proxys: ProxySilo[],
            actionId: number,
            rightHand: number[],
            activate: boolean,
            chunks: number
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playersAddress = coreStore.getAddress(Address.estforPlayers)
            const account = getAccount()
            if (!factoryAddress || !playersAddress || !account.isConnected) {
                return
            }

            const factoryInterface = new Interface(factoryAbi)
            const playersInterface = new Interface(estforPlayerAbi)

            const selectorArray = proxys.map((h, i) =>
                solidityPacked(
                    ["bytes"],
                    [
                        factoryInterface.encodeFunctionData("setTransaction", [
                            h.address,
                            0,
                            playersAddress, // estfor players contract address
                            playersInterface.encodeFunctionData(
                                "startActions",
                                [
                                    BigInt(h.playerState.id), // playerId
                                    constructQueuedActions(
                                        actionId,
                                        rightHand[i]
                                    ), // solidity QueuedAction[] (different from api type)
                                    ActionQueueStatus.KEEP_LAST_IN_PROGRESS, // action queue status - NONE / APPEND / KEEP_LAST_IN_PROGRESS
                                ]
                            ),
                        ]),
                    ]
                )
            )

            const pauseArray = proxys
                .filter((h) => h.isPaused === activate)
                .map((h) =>
                    solidityPacked(
                        ["bytes"],
                        [
                            factoryInterface.encodeFunctionData("setPaused", [
                                h.address,
                                !activate,
                            ]),
                        ]
                    )
                )

            const combined = [...pauseArray, ...selectorArray]

            const splits = Math.ceil(combined.length / chunks)
            for (let i = 0; i < splits; i++) {
                const tx = await writeContract({
                    address: factoryAddress as `0x${string}`,
                    abi: factoryAbi,
                    functionName: "multicall",
                    args: [combined.slice(i * chunks, (i + 1) * chunks)],
                })
                await waitForTransaction({ hash: tx.hash })
            }

            // update savedTransactions and isPaused in state
            let i = 0
            for (const p of proxys) {
                const proxy = this.proxys.find((x) => x.address === p.address)
                if (proxy) {
                    proxy.savedTransactions = [
                        {
                            to: playersAddress,
                            data: playersInterface.encodeFunctionData(
                                "startActions",
                                [
                                    BigInt(p.playerState.id),
                                    constructQueuedActions(
                                        actionId,
                                        rightHand[i]
                                    ),
                                    ActionQueueStatus.KEEP_LAST_IN_PROGRESS,
                                ]
                            ),
                        },
                    ]
                    proxy.isPaused = !activate
                }
                i++
            }
        },
        async executeSavedTransactions(proxys: ProxySilo[], chunks: number) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount()
            if (!factoryAddress || !account.isConnected) {
                return
            }

            const factoryInterface = new Interface(factoryAbi)

            const selectorArray = proxys.map((h) =>
                solidityPacked(
                    ["bytes"],
                    [
                        factoryInterface.encodeFunctionData(
                            "executeSavedTransactions",
                            [h.address]
                        ),
                    ]
                )
            )

            const splits = Math.ceil(proxys.length / chunks)
            for (let i = 0; i < splits; i++) {
                const tx = await writeContract({
                    address: factoryAddress as `0x${string}`,
                    abi: factoryAbi,
                    functionName: "multicall",
                    args: [selectorArray.slice(i * chunks, (i + 1) * chunks)],
                })
                await waitForTransaction({ hash: tx.hash })
            }

            // update queuedActions in state
            const queuedActionPromises = await Promise.all(
                proxys.map((p) => searchQueuedActions(p.playerId))
            )
            for (const p of proxys) {
                const proxy = this.proxys.find((x) => x.address === p.address)
                if (proxy) {
                    proxy.queuedActions =
                        queuedActionPromises
                            .filter((x) =>
                                x.queuedActions.find(
                                    (q) => q.playerId === p.playerId
                                )
                            )
                            .map((x) => x.queuedActions)
                            .flat() || []
                }
            }
        },
        async withdrawItems(items: any[]) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT)
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount()
            if (!factoryAddress || !itemAddress || !account.isConnected) {
                return
            }

            const fromAddress = this.bank?.address
            if (!fromAddress) {
                return
            }

            const factoryInterface = new Interface(factoryAbi)
            const itemInterface = new Interface(itemNFTAbi)

            const selectorArray = [
                solidityPacked(
                    ["bytes"],
                    [
                        factoryInterface.encodeFunctionData("execute", [
                            fromAddress,
                            itemAddress,
                            itemInterface.encodeFunctionData(
                                "safeBatchTransferFrom",
                                [
                                    fromAddress,
                                    account.address,
                                    items.map((i) => i.tokenId),
                                    items.map((i) => i.amount),
                                    solidityPacked(["bytes"], ["0x"]),
                                ]
                            ),
                        ]),
                    ]
                ),
            ]

            const tx = await writeContract({
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "multicall",
                args: [selectorArray],
            })
            await waitForTransaction({ hash: tx.hash })
        },
    },
})
