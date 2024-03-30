import {
    getAccount,
    multicall,
    readContract,
    waitForTransactionReceipt,
    writeContract,
    estimateGas,
} from "@wagmi/core"
import {
    ActionChoiceInput,
    ActionQueueStatus,
    CombatStyle,
    GuaranteedReward,
    Player,
    QueuedAction,
    Skill,
    UserItemNFT,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"
import { ZeroAddress, solidityPacked, Interface } from "ethers"
import { fantom } from "viem/chains"

import { Address, getLevel, skillToXPMap, useCoreStore } from "./core"

import estforPlayerAbi from "../abi/estforPlayer.json"
import itemNFTAbi from "../abi/itemNFT.json"
import estforPlayerNFTAbi from "../abi/estforPlayerNFT.json"
import factoryAbi from "../abi/factoryRegistry.json"
import epProxyAbi from "../abi/epProxy.json"
import {
    PlayerSearchResult,
    SearchQueuedActionsResult,
    getPlayersByOwner,
    getUserItemNFTs,
    searchQueuedActions,
} from "../utils/api"
import { decode } from "../utils/abi"
import { allActions } from "../data/actions"
import { calculateChance } from "../utils/player"
import { getActionChoiceById, useSkillStore } from "./skills"
import { sleep } from "../utils/time"
import { config } from "../config"

export interface SavedTransaction {
    to: string
    data: any
}

export interface ProxySilo {
    address: string
    owner: string
    index: number
    allPlayers: Player[]
    playerId: string
    playerState: Player
    isPaused: boolean
    savedTransactions: SavedTransaction[]
    queuedActions: QueuedAction[]
}

export interface FactoryState {
    proxys: ProxySilo[]
    bankItems: UserItemNFT[]
    initialised: boolean
    initialisedAt: Date | null
    totalTransactionNumber: number
    currentTransactionNumber: number
}

export interface AggregatedItem {
    rate: number
    outgoingRate: number
    amount: string
    tokenId: number
}

export interface NeededItem {
    address: string
    items: { tokenId: number; amount: number }[]
}

export interface TransferUserItemNFT extends UserItemNFT {
    transferAmount: number
}

export const calculateActionChoiceSuccessPercent = (
    a: ActionChoiceInput,
    playerXP: string,
    skillId: Skill
): number => {
    return (
        Math.min(
            90,
            a.successPercent +
                Math.max(
                    0,
                    getLevel(playerXP) -
                        getLevel(
                            a.minXPs[
                                a.minSkills.findIndex((s) => s === skillId)
                            ] || 0
                        )
                )
        ) / 100
    )
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
        const actionChoiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
        const action = allActions.find((a) => a.actionId === Number(actionId))
        const actionChoice = getActionChoiceById(
            Number(actionId),
            Number(actionChoiceId)
        )
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
        if (actionChoice) {
            const existing = items.find(
                (x) => x.itemTokenId === actionChoice.outputTokenId
            )
            if (existing) {
                existing.rate +=
                    actionChoice.outputAmount *
                    (actionChoice.rate / 1000) *
                    calculateActionChoiceSuccessPercent(
                        actionChoice,
                        // @ts-ignore
                        s.playerState[skillToXPMap[actionChoice.skill]],
                        actionChoice.skill
                    )
            } else {
                items.push({
                    itemTokenId: actionChoice.outputTokenId,
                    rate:
                        actionChoice.outputAmount *
                        (actionChoice.rate / 1000) *
                        calculateActionChoiceSuccessPercent(
                            actionChoice,
                            // @ts-ignore
                            s.playerState[skillToXPMap[actionChoice.skill]],
                            actionChoice.skill
                        ),
                })
            }
        }
    }
    return items
}

export const getOutgoingItems = (proxys: ProxySilo[]) => {
    const items: GuaranteedReward[] = []
    for (const s of proxys) {
        const decoded = decode(
            s.savedTransactions[0].data,
            "startActions",
            estforPlayerAbi
        )
        const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
        const actionChoiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
        const actionChoice = getActionChoiceById(
            Number(actionId),
            Number(actionChoiceId)
        )
        if (actionChoice) {
            let i = 0
            for (const input of actionChoice.inputTokenIds) {
                const existing = items.find((x) => x.itemTokenId === input)
                if (existing) {
                    existing.rate +=
                        actionChoice.inputAmounts[i] *
                        (actionChoice.rate / 1000)
                } else {
                    items.push({
                        itemTokenId: input,
                        rate:
                            actionChoice.inputAmounts[i] *
                            (actionChoice.rate / 1000),
                    })
                }
                i++
            }
        }
    }
    return items
}

const constructQueuedActions = (
    actionId: number,
    choiceId: number,
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
            choiceId, // choice id
            rightHand || 0, // weapon or tool
            0, // shield
            60 * 60 * 24, // 24 hours
            CombatStyle.NONE, // NONE / ATTACK / DEFENCE
        ],
    ]
}

export const calculateExtraXPForHeroActionInput = (h: ProxySilo, skillId: Skill): number => {
    const skillStore = useSkillStore()
    const relevantActions = h.queuedActions.filter(
        (x) => x.skill == skillId
    )
    let extraXP = 0
    const timenow = Date.now() / 1000
    for (const action of relevantActions) {
        const a = skillStore
            .getActionInputsForSkill(skillId)
            .find((s) => s.actionId == action.actionId)
        if (!a) {
            continue
        }
        if (parseInt(action.startTime) + action.timespan < timenow) {
            extraXP += a.info.xpPerHour * (action.timespan / 60 / 60)
        }
        else if (parseInt(action.startTime) < timenow) {
            const timeInAction =
                timenow - parseInt(action.startTime)
            extraXP +=
                a.info.xpPerHour *
                ((timeInAction) / 60 / 60)
        }
    }
    return extraXP
}

export const calculateExtraXPForHeroActionChoiceInput = (h: ProxySilo, skillId: Skill): number => {
    const skillStore = useSkillStore()
    const relevantActions = h.queuedActions.filter(
        (x) => x.skill == skillId
    )
    let extraXP = 0
    const timenow = Date.now() / 1000
    for (const action of relevantActions) {
        const a = skillStore
            .getActionChoiceInputsForSkill(skillId)
            .find((s) => s === Number(action.choice.id))
        if (!a) {
            continue
        }
        if (parseInt(action.startTime) + action.timespan < timenow) {
            extraXP += action.choice.xpPerHour * (action.timespan / 60 / 60)
        }
        else if (parseInt(action.startTime) < timenow) {
            const timeInAction =
                timenow - parseInt(action.startTime)
            extraXP +=
                action.choice.xpPerHour *
                ((timeInAction) / 60 / 60)
        }
    }
    return extraXP
}

const getChunksForMulticall = async (
    data: any[],
    to: string,
    contract: Interface,
    chunks: number
) => {
    let attempts = 0
    let actualChunks = chunks
    let success = false
    while (!success) {
        try {
            const splits = Math.ceil(data.length / actualChunks)
            for (let i = 0; i < splits; i++) {
                const result = await estimateGas(config, {
                    account: getAccount(config).address,
                    to: to as `0x${string}`,
                    data: contract.encodeFunctionData("multicall", [
                        data.slice(i * actualChunks, (i + 1) * actualChunks),
                    ]) as `0x${string}`,
                    type: 'legacy', // ftm is lame
                })
                if (result > 6660000) {
                    throw new Error("Gas estimate too high")
                }
            }
            success = true
        } catch {
            actualChunks -= 5
            attempts++
            if (actualChunks < 1) {
                actualChunks = 1
            }
            if (attempts > 20) {
                throw new Error("Failed to estimate gas")
            }
        }
    }
    return actualChunks
}

export const useFactoryStore = defineStore({
    id: "factory",
    state: () =>
        ({
            proxys: [] as ProxySilo[],
            initialised: false,
            initialisedAt: null,
            bankItems: [] as UserItemNFT[],
            totalTransactionNumber: 0,
            currentTransactionNumber: 0,
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
        async setActive(siloAddress: string, playerId: string) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playersAddress = coreStore.getAddress(Address.estforPlayers)
            const account = getAccount(config)

            if (!factoryAddress || !playersAddress || !account.isConnected) {
                return
            }

            const playersInterface = new Interface(estforPlayerAbi)
            const data = playersInterface.encodeFunctionData(
                "setActivePlayer",
                [playerId]
            )

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "execute",
                args: [siloAddress, playersAddress, data],
                type: 'legacy',
            })

            await waitForTransactionReceipt(config, { hash })
        },
        async transferHero(
            siloAddress: string,
            playerId: string,
            toAddress: string
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT
            )
            const account = getAccount(config)

            if (!factoryAddress || !playerNFTAddress || !account.isConnected) {
                return
            }

            const playerNFTInterface = new Interface(estforPlayerNFTAbi)
            const data = playerNFTInterface.encodeFunctionData(
                "safeTransferFrom",
                [
                    siloAddress,
                    toAddress,
                    playerId,
                    1,
                    solidityPacked(["bytes"], ["0x"]),
                ]
            )

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "execute",
                args: [siloAddress, playerNFTAddress, data],
                type: 'legacy',
            })

            await waitForTransactionReceipt(config, { hash })
        },
        async mintHeroes(heroes: any[]) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT
            )
            const account = getAccount(config)
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

            const actualChunks = await getChunksForMulticall(
                selectorArray,
                factoryAddress,
                factoryInterface,
                10
            )
            const splits = Math.ceil(heroes.length / actualChunks)
            this.totalTransactionNumber = splits
            try {
                for (let i = 0; i < splits; i++) {
                    this.currentTransactionNumber = i + 1
                    const hash = await writeContract(config, {
                        address: factoryAddress as `0x${string}`,
                        abi: factoryAbi,
                        functionName: "multicall",
                        args: [
                            selectorArray.slice(
                                i * actualChunks,
                                (i + 1) * actualChunks
                            ),
                        ],
                        type: 'legacy',
                    })
                    await waitForTransactionReceipt(config, { hash })
                }
            } catch (e) {
                throw e
            } finally {
                this.totalTransactionNumber = 0
                this.currentTransactionNumber = 0
            }
            await this.getAllProxyStates()
        },
        async getAllProxyStates(proxys: ProxySilo[] = []) {
            const coreStore = useCoreStore()
            const playerAddress = coreStore.getAddress(Address.estforPlayers)
            const account = getAccount(config)
            if (!playerAddress || !account.isConnected) {
                return
            }

            if (proxys.length === 0) {
                proxys = this.proxys
            }

            const proxyContract = {
                abi: epProxyAbi,
                chainId: fantom.id,
            }

            // do this in 20 player chunks
            const chunks = 20
            const playerChunks = Math.ceil(this.proxys.length / chunks)
            const playerPromises: PlayerSearchResult[] = []

            for (let i = 0; i < playerChunks; i++) {
                const promises = await Promise.all(
                    this.proxys
                        .slice(i * chunks, (i + 1) * chunks)
                        .map((p) => getPlayersByOwner(p.address))
                )
                playerPromises.push(...promises)
                await sleep(200)
            }

            const proxysWithPlayerId = this.proxys.map((p) => {
                const result = playerPromises.find(
                    (x) =>
                        x.players?.some(
                            (y) =>
                                y.owner?.toLowerCase() ===
                                p.address.toLowerCase()
                        )
                )
                return {
                    ...p,
                    playerId:
                        result?.players?.find((x) => x.isActive)?.tokenId || "",
                    allPlayers: result?.players || [],
                    playerState:
                        result?.players?.find((x) => x.isActive) ||
                        ({} as Player),
                }
            })

            const playerIdsToGet = proxysWithPlayerId
                .filter((p) => p.playerId !== "")
                .map((p) => p.playerId)
            if (playerIdsToGet.length > 0) {
                const queuedActionPromises: SearchQueuedActionsResult[] = []
                const chunks = 20
                const queueChunks = Math.ceil(playerIdsToGet.length / chunks)

                for (let i = 0; i < queueChunks; i++) {
                    const promises = await Promise.all(
                        playerIdsToGet
                            .slice(i * chunks, (i + 1) * chunks)
                            .map((p) => searchQueuedActions(p))
                    )
                    queuedActionPromises.push(...promises)
                    await sleep(200)
                }
                const proxyData = await multicall(config, {
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

                const proxyPauseData = await multicall(config, {
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

            await this.getBankItems()
        },
        async createProxy(proxyNumber: number) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount(config)
            if (!factoryAddress || !account.isConnected) {
                return
            }

            proxyNumber = Math.floor(proxyNumber)
            const factoryInterface = new Interface(factoryAbi)
            const data = factoryInterface.encodeFunctionData("createProxy", [])
            const selectorArray = Array.from({ length: proxyNumber }, () =>
                solidityPacked(["bytes"], [data])
            )

            const factoryContract = {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                chainId: fantom.id,
            }

            const actualChunks = await getChunksForMulticall(
                selectorArray,
                factoryAddress,
                factoryInterface,
                15
            )
            const splits = Math.ceil(proxyNumber / actualChunks)
            this.totalTransactionNumber = splits
            try {
                for (let i = 0; i < splits; i++) {
                    this.currentTransactionNumber = i + 1
                    const hash = await writeContract(config, {
                        ...factoryContract,
                        functionName: "multicall",
                        args: [
                            selectorArray.slice(
                                i * actualChunks,
                                (i + 1) * actualChunks
                            ),
                        ],
                        type: 'legacy',
                    })
                    await waitForTransactionReceipt(config, { hash })
                }
            } catch (e) {
                throw e
            } finally {
                this.totalTransactionNumber = 0
                this.currentTransactionNumber = 0
            }
        },
        async setProxys(proxys: any[]) {
            const account = getAccount(config)

            this.proxys = proxys
                .filter((value, index, self) => {
                    return (
                        self.findIndex((v) => v.proxy === value.proxy) === index
                    )
                })
                .map((d) => {
                    // Fix for pre-event proxys with the same id
                    let proxyId = d.proxyId
                    let sameProxyIds = proxys.filter(
                        (p) => p.proxyId === d.proxyId
                    )
                    if (sameProxyIds.length > 1) {
                        sameProxyIds.sort((a, b) => {
                            if (a.proxy > b.proxy) {
                                return 1
                            }
                            if (a.proxy < b.proxy) {
                                return -1
                            }
                            return 0
                        })
                        proxyId = (
                            Number(proxyId) +
                            sameProxyIds.findIndex((p) => p.proxy === d.proxy) -
                            sameProxyIds.length +
                            1
                        ).toString()
                    }
                    return {
                        address: d.proxy,
                        index: proxyId,
                        allPlayers: [],
                        playerId: "",
                        playerState: {} as Player,
                        queuedActions: [] as QueuedAction[],
                        owner: account.address as string,
                        isPaused: true,
                        savedTransactions: [] as SavedTransaction[],
                    }
                })

            this.proxys.sort((a, b) => {
                if (Number(a.index) > Number(b.index)) {
                    return 1
                }
                if (Number(a.index) < Number(b.index)) {
                    return -1
                }
                return 0
            })
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
            const account = getAccount(config)
            if (!factoryAddress || !account.isConnected) {
                return
            }

            const factoryContract = {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                chainId: fantom.id,
            }

            const totalAddressCount: bigint = (await readContract(config, {
                ...factoryContract,
                functionName: "totalAddressCount",
                args: [],
            })) as bigint

            const data = await multicall(config, {
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
                        allPlayers: [],
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
            choiceId: number,
            rightHand: number[],
            actionQueueStatus: ActionQueueStatus,
            activate: boolean
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playersAddress = coreStore.getAddress(Address.estforPlayers)
            const account = getAccount(config)
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
                                        choiceId,
                                        rightHand[i]
                                    ), // solidity QueuedAction[] (different from api type)
                                    actionQueueStatus, // action queue status - NONE / APPEND / KEEP_LAST_IN_PROGRESS
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

            const actualChunks = await getChunksForMulticall(
                combined,
                factoryAddress,
                factoryInterface,
                40
            )
            const splits = Math.ceil(combined.length / actualChunks)
            this.totalTransactionNumber = splits
            try {
                for (let i = 0; i < splits; i++) {
                    this.currentTransactionNumber = i + 1
                    const hash = await writeContract(config, {
                        address: factoryAddress as `0x${string}`,
                        abi: factoryAbi,
                        functionName: "multicall",
                        args: [
                            combined.slice(
                                i * actualChunks,
                                (i + 1) * actualChunks
                            ),
                        ],
                        type: 'legacy',
                    })
                    await waitForTransactionReceipt(config, { hash })
                }
            } catch (e) {
                throw e
            } finally {
                this.totalTransactionNumber = 0
                this.currentTransactionNumber = 0
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
                                        choiceId,
                                        rightHand[i]
                                    ),
                                    actionQueueStatus,
                                ]
                            ),
                        },
                    ]
                    proxy.isPaused = !activate
                }
                i++
            }
        },
        async transferItemsFromBankToProxys(itemsNeeded: NeededItem[]) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const itemAddress = coreStore.getAddress(Address.itemNFT)
            const account = getAccount(config)
            if (!factoryAddress || !itemAddress || !account.isConnected) {
                return
            }
            if (itemsNeeded.length > 0) {
                const factoryInterface = new Interface(factoryAbi)
                const itemInterface = new Interface(itemNFTAbi)
                const fromAddress = this.bank?.address

                const selectorArray = itemsNeeded.map((i) =>
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
                                        i.address,
                                        i.items.map((i) => i.tokenId),
                                        i.items.map((i) => i.amount),
                                        solidityPacked(["bytes"], ["0x"]),
                                    ]
                                ),
                            ]),
                        ]
                    )
                )

                const actualChunks = await getChunksForMulticall(
                    selectorArray,
                    factoryAddress,
                    factoryInterface,
                    40
                )
                const splits = Math.ceil(selectorArray.length / actualChunks)
                this.totalTransactionNumber = splits
                try {
                    for (let i = 0; i < splits; i++) {
                        this.currentTransactionNumber = i + 1
                        const hash = await writeContract(config, {
                            address: factoryAddress as `0x${string}`,
                            abi: factoryAbi,
                            functionName: "multicall",
                            args: [
                                selectorArray.slice(
                                    i * actualChunks,
                                    (i + 1) * actualChunks
                                ),
                            ],
                            type: 'legacy',
                        })
                        await waitForTransactionReceipt(config, { hash })
                    }
                } catch (e) {
                    throw e
                } finally {
                    this.totalTransactionNumber = 0
                    this.currentTransactionNumber = 0
                }
            }
            await this.getBankItems()
        },
        async executeSavedTransactions(proxys: ProxySilo[]) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const itemAddress = coreStore.getAddress(Address.itemNFT)
            const account = getAccount(config)
            if (!factoryAddress || !itemAddress || !account.isConnected) {
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

            const actualChunks = await getChunksForMulticall(
                selectorArray,
                factoryAddress,
                factoryInterface,
                20
            )
            const splits = Math.ceil(selectorArray.length / actualChunks)
            this.totalTransactionNumber = splits
            try {
                for (let i = 0; i < splits; i++) {
                    this.currentTransactionNumber = i + 1
                    const hash = await writeContract(config, {
                        address: factoryAddress as `0x${string}`,
                        abi: factoryAbi,
                        functionName: "multicall",
                        args: [
                            selectorArray.slice(
                                i * actualChunks,
                                (i + 1) * actualChunks
                            ),
                        ],
                        type: 'legacy',
                    })
                    await waitForTransactionReceipt(config, { hash })
                }
            } catch (e) {
                throw e
            } finally {
                this.totalTransactionNumber = 0
                this.currentTransactionNumber = 0
            }
            await this.getBankItems()
            await this.updateQueuedActions()
        },
        async updateQueuedActions() {
            const queuedActionPromises = await Promise.all(
                this.proxys
                    .filter(
                        (p) =>
                            p.playerId !== "" && p.savedTransactions.length > 0
                    )
                    .map((p) => searchQueuedActions(p.playerId))
            )
            for (const proxy of this.proxys) {
                if (
                    proxy.playerId === "" ||
                    proxy.savedTransactions.length === 0
                ) {
                    continue
                }
                proxy.queuedActions =
                    queuedActionPromises
                        .filter((x) =>
                            x.queuedActions.find(
                                (q) => q.playerId === proxy.playerId
                            )
                        )
                        .map((x) => x.queuedActions)
                        .flat() || []
            }
        },
        async withdrawItems(items: any[]) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT)
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount(config)
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

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "multicall",
                args: [selectorArray],
                type: 'legacy',
            })
            await waitForTransactionReceipt(config, { hash })
            await this.getBankItems()
        },
        async transferItemsToBank() {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT)
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount(config)
            if (!factoryAddress || !itemAddress || !account.isConnected) {
                return
            }

            const toAddress = this.bank?.address
            if (!toAddress) {
                return
            }

            const itemResultPromises = this.assignedProxys
                .filter((p) => p.address !== this.bank?.address)
                .map((p) => getUserItemNFTs(p.address, []))
            const results = await Promise.all(itemResultPromises)

            // match proxy on item result user address and work out the outputs from the decoded saved transaction
            const deposits: { items: UserItemNFT[]; proxy: string }[] = []
            for (const result of results.filter(
                (r) => r.userItemNFTs.length > 0
            )) {
                const proxy = this.assignedProxys.find(
                    (p) => p.address === result.userItemNFTs[0].user
                )
                if (!proxy) {
                    continue
                }

                const decoded = decode(
                    proxy.savedTransactions[0].data,
                    "startActions",
                    estforPlayerAbi
                )
                const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
                const actionChoiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
                const action = allActions.find(
                    (a) => a.actionId === Number(actionId)
                )
                const actionChoice = getActionChoiceById(
                    Number(actionId),
                    Number(actionChoiceId)
                )
                const relevantTokenIds: number[] = []
                if (action) {
                    relevantTokenIds.push(
                        ...action.guaranteedRewards.map((r) => r.itemTokenId)
                    )
                    relevantTokenIds.push(
                        ...action.randomRewards.map((r) => r.itemTokenId)
                    )
                }
                if (actionChoice) {
                    relevantTokenIds.push(actionChoice.outputTokenId)
                    // relevantTokenIds.push(...actionChoice.inputTokenIds)
                }

                for (const q of proxy.queuedActions) {
                    if (q.choice) {
                        relevantTokenIds.push(q.choice.outputTokenId)
                    } else {
                        const action = allActions.find(
                            (a) => a.actionId === q.actionId
                        )
                        if (action) {
                            relevantTokenIds.push(
                                ...action.guaranteedRewards.map(
                                    (r) => r.itemTokenId
                                )
                            )
                            relevantTokenIds.push(
                                ...action.randomRewards.map(
                                    (r) => r.itemTokenId
                                )
                            )
                        }
                    }
                }

                for (const item of result.userItemNFTs.filter((i) =>
                    relevantTokenIds.includes(i.tokenId)
                )) {
                    let d = deposits.find((d) => d.proxy === proxy.address)
                    if (!d) {
                        d = {
                            proxy: proxy?.address,
                            items: [],
                        }
                        deposits.push(d)
                    }
                    d.items.push(item)
                }
            }

            const factoryInterface = new Interface(factoryAbi)
            const itemInterface = new Interface(itemNFTAbi)

            const selectorArray = deposits.map((i) =>
                solidityPacked(
                    ["bytes"],
                    [
                        factoryInterface.encodeFunctionData("execute", [
                            i.proxy,
                            itemAddress,
                            itemInterface.encodeFunctionData(
                                "safeBatchTransferFrom",
                                [
                                    i.proxy,
                                    toAddress,
                                    i.items.map((i) => i.tokenId),
                                    i.items.map((i) => i.amount),
                                    solidityPacked(["bytes"], ["0x"]),
                                ]
                            ),
                        ]),
                    ]
                )
            )

            if (selectorArray.length > 0) {
                const actualChunks = await getChunksForMulticall(
                    selectorArray,
                    factoryAddress,
                    factoryInterface,
                    50
                )
                const splits = Math.ceil(selectorArray.length / actualChunks)
                this.totalTransactionNumber = splits
                try {
                    for (let i = 0; i < splits; i++) {
                        this.currentTransactionNumber = i + 1
                        const hash = await writeContract(config, {
                            address: factoryAddress as `0x${string}`,
                            abi: factoryAbi,
                            functionName: "multicall",
                            args: [
                                selectorArray.slice(
                                    i * actualChunks,
                                    (i + 1) * actualChunks
                                ),
                            ],
                            type: 'legacy',
                        })
                        await waitForTransactionReceipt(config, { hash })
                    }
                } catch (e) {
                    throw e
                } finally {
                    this.totalTransactionNumber = 0
                    this.currentTransactionNumber = 0
                }
            }
            await this.getBankItems()
        },

        async transferItemsToAddress(
            siloAddress: string,
            toAddress: string,
            items: TransferUserItemNFT[]
        ) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT)
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount(config)
            if (!factoryAddress || !itemAddress || !account.isConnected) {
                return
            }

            const itemInterface = new Interface(itemNFTAbi)

            const data = itemInterface.encodeFunctionData(
                "safeBatchTransferFrom",
                [
                    siloAddress,
                    toAddress,
                    items.map((i) => i.tokenId),
                    items.map((i) => i.transferAmount),
                    solidityPacked(["bytes"], ["0x"]),
                ]
            )

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "execute",
                args: [siloAddress, itemAddress, data],
                type: 'legacy',
            })
            await waitForTransactionReceipt(config, { hash })
            await this.getBankItems()
        },
        async getBankItems() {
            if (this.bank) {
                const result = await getUserItemNFTs(this.bank.address, [])
                this.bankItems = result.userItemNFTs || []
            }
        },
    },
})
