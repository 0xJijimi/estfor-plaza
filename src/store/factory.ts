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
import brushAbi from "../abi/brush.json"
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
import {
    actionChoiceNames,
    actionNames,
    getActionChoiceById,
    getCombatActionChoiceById,
    useSkillStore,
} from "./skills"
import { sleep } from "../utils/time"
import { config, estimateConfig } from "../config"
import { useBroochStore } from "./brooch"
import { useMonsterStore } from "./monsters"
import { EquippedItems, FactoryState, NeededItem, ProxySilo, SavedTransaction, TransferUserItemNFT } from "./models/factory.models"
import { allItems } from "../data/items"

export const proxyNeedsItem = (item: UserItemNFT, p: ProxySilo): boolean => {
    for (const a of p.queuedActions) {
        if (a.feetEquipped === item.tokenId) {
            return true
        }
        if (a.armsEquipped === item.tokenId) {
            return true
        }
        if (a.bodyEquipped === item.tokenId) {
            return true
        }
        if (a.headEquipped === item.tokenId) {
            return true
        }
        if (a.leftHandEquipmentTokenId === item.tokenId) {
            return true
        }
        if (a.rightHandEquipmentTokenId === item.tokenId) {
            return true
        }
        if (a.legsEquipped === item.tokenId) {
            return true
        }
        if (a.neckEquipped === item.tokenId) {
            return true
        }
        if (a.ringEquipped === item.tokenId) {
            return true
        }
    }
    for (const a of p.savedTransactions) {
        const decoded = decode(a.data, "startActions", estforPlayerAbi)
        const equippedItems: EquippedItems = {
            rightHand: Number(decoded?.[1]?.[0]?.[4]),
            leftHand: Number(decoded?.[1]?.[0]?.[5]),
            food: Number(decoded?.[1]?.[0]?.[2]),
            head: Number(decoded?.[1]?.[0]?.[0]?.[0]),
            neck: Number(decoded?.[1]?.[0]?.[0]?.[1]),
            body: Number(decoded?.[1]?.[0]?.[0]?.[2]),
            arms: Number(decoded?.[1]?.[0]?.[0]?.[3]),
            legs: Number(decoded?.[1]?.[0]?.[0]?.[4]),
            feet: Number(decoded?.[1]?.[0]?.[0]?.[5]),
            magicBag: 0,
            quiver: 0,
            playerId: 0,
            pet: undefined,
        }
        if (equippedItems.feet === item.tokenId) {
            return true
        }
        if (equippedItems.arms === item.tokenId) {
            return true
        }
        if (equippedItems.body === item.tokenId) {
            return true
        }
        if (equippedItems.head === item.tokenId) {
            return true
        }
        if (equippedItems.leftHand === item.tokenId) {
            return true
        }
        if (equippedItems.rightHand === item.tokenId) {
            return true
        }
        if (equippedItems.legs === item.tokenId) {
            return true
        }
        if (equippedItems.neck === item.tokenId) {
            return true
        }
    }
    return false
}

export const calculateActionChoiceSuccessPercent = (
    a: ActionChoiceInput,
    playerXP: string,
    skillId: Skill
): number => {
    if (a.successPercent === 100) {
        return 1
    }
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
    const monsterStore = useMonsterStore()
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
            const isCombat = action.info.skill === Skill.COMBAT
            let amountMultiplier = 1
            if (isCombat) {
                const { numKilled } = monsterStore.getKillsPerHour(24, s, action)
                amountMultiplier = numKilled / 24
            }

            for (const i of action.guaranteedRewards) {
                const existing = items.find(
                    (x) => x.itemTokenId === i.itemTokenId
                )
                if (existing) {
                    existing.rate += i.rate / 10 * amountMultiplier
                } else {
                    items.push({ ...i, rate: i.rate / 10 * amountMultiplier })
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
                        i.amount * amountMultiplier
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
                            i.amount * amountMultiplier,
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
    const monsterStore = useMonsterStore()
    for (const s of proxys) {
        const decoded = decode(
            s.savedTransactions[0].data,
            "startActions",
            estforPlayerAbi
        )
        const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
        const food = decoded?.[1]?.[0]?.[2] || BigInt(0)
        const actionChoiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
        const action = allActions.find((a) => a.actionId === Number(actionId))
        const actionChoice = getActionChoiceById(
            Number(actionId),
            Number(actionChoiceId)
        )
        if (action) {
            const isCombat = action.info.skill === Skill.COMBAT
            if (isCombat) {
                const { totalFoodRequired, itemsConsumed } = monsterStore.getKillsPerHour(24, s, action)
                {
                    const existing = items.find(
                        (x) => x.itemTokenId === Number(food)
                    )                                
                    if (existing) {
                        existing.rate += totalFoodRequired / 24
                    } else {
                        items.push({ itemTokenId: Number(food), rate: totalFoodRequired / 24 })
                    }
                }

                if (itemsConsumed > 0) {
                    const actionChoice = getCombatActionChoiceById(Number(actionChoiceId))            
                    if (actionChoice) {
                        let i = 0
                        for (const input of actionChoice.inputTokenIds) {
                            const existing = items.find((x) => x.itemTokenId === input)
                            if (existing) {
                                existing.rate += itemsConsumed / 24
                            } else {
                                items.push({
                                    itemTokenId: input,
                                    rate: itemsConsumed / 24,
                                })
                            }
                            i++
                        }
                    }
                }
            }
        }
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
    head: number | undefined,
    neck: number | undefined,
    body: number | undefined,
    arms: number | undefined,
    legs: number | undefined,
    feet: number | undefined,
    food: number | undefined,
    leftHand: number | undefined,
    rightHand: number | undefined,
    combatStyle: CombatStyle
): any[] => {
    return [
        [
            [
                head || 0, // head
                neck || 0, // neck
                body || 0, // body
                arms || 0, // arms
                legs || 0, // legs
                feet || 0, // feet
                0, // ring
                0, // reserved1
            ],
            actionId,
            food || 0, // food
            choiceId, // choice id
            rightHand || 0, // weapon or tool
            leftHand || 0, // shield
            60 * 60 * 24, // 24 hours
            combatStyle, // NONE / ATTACK / DEFENCE
        ],
    ]
}

export const calculateExtraXPForHeroActionInput = (
    h: ProxySilo,
    skillId: Skill
): { extraXP: number, defenceXP: number, magicXP: number, meleeXP: number, rangedXP: number } => {
    const skillStore = useSkillStore()
    const monsterStore = useMonsterStore()
    const relevantActions = h.queuedActions.filter((x) => x.skill == skillId)
    let extraXP = 0
    let defenceXP = 0
    let magicXP = 0
    let meleeXP = 0
    let rangedXP = 0
    const timenow = Date.now() / 1000
    for (const action of relevantActions) {
        const a = skillStore
            .getActionInputsForSkill(skillId)
            .find((s) => s.actionId == action.actionId)
        if (!a) {
            continue
        }
        if (parseInt(action.startTime) + action.timespan < timenow) {
            if (action.skill === Skill.COMBAT) {
                const { xpPerHour } = monsterStore.getKillsPerHour((action.timespan / 60 / 60), h, a)
                if (action.combatStyle === CombatStyle.DEFENCE) {
                    defenceXP += xpPerHour * (action.timespan / 60 / 60)
                } else {
                    const rightHand = allItems.find(x => x.tokenId === action.rightHandEquipmentTokenId)
                    if (rightHand) {
                        if (rightHand.skill === Skill.MAGIC) {
                            magicXP += xpPerHour * (action.timespan / 60 / 60)
                        } else if (rightHand.skill === Skill.MELEE) {
                            meleeXP += xpPerHour * (action.timespan / 60 / 60)
                        } else if (rightHand.skill === Skill.RANGED) {
                            rangedXP += xpPerHour * (action.timespan / 60 / 60)
                        }
                    }
                }
            } else {
                extraXP += a.info.xpPerHour * (action.timespan / 60 / 60)
            }
        } else if (parseInt(action.startTime) < timenow) {
            const timeInAction = timenow - parseInt(action.startTime)
            if (action.skill === Skill.COMBAT) {
                const { xpPerHour } = monsterStore.getKillsPerHour((timeInAction / 60 / 60), h, a)
                if (action.combatStyle === CombatStyle.DEFENCE) {
                    defenceXP += xpPerHour * (timeInAction / 60 / 60)
                } else {
                    const rightHand = allItems.find(x => x.tokenId === action.rightHandEquipmentTokenId)
                    if (rightHand) {
                        if (rightHand.skill === Skill.MAGIC) {
                            magicXP += xpPerHour * (timeInAction / 60 / 60)
                        } else if (rightHand.skill === Skill.MELEE) {
                            meleeXP += xpPerHour * (timeInAction / 60 / 60)
                        } else if (rightHand.skill === Skill.RANGED) {
                            rangedXP += xpPerHour * (timeInAction / 60 / 60)
                        }
                    }
                }
            } else {
                extraXP += a.info.xpPerHour * (timeInAction / 60 / 60)
            }
        }
    }
    return { extraXP, defenceXP, magicXP, meleeXP, rangedXP }
}

export const calculateExtraXPForHeroActionChoiceInput = (
    h: ProxySilo,
    skillId: Skill
): number => {
    const skillStore = useSkillStore()
    const relevantActions = h.queuedActions.filter((x) => x.skill == skillId)
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
        } else if (parseInt(action.startTime) < timenow) {
            const timeInAction = timenow - parseInt(action.startTime)
            extraXP += action.choice.xpPerHour * (timeInAction / 60 / 60)
        }
    }
    return extraXP
}

export const decodeTransaction = (savedTransactions: SavedTransaction[]) => {
    if (savedTransactions.length === 0) {
        return "No action"
    }

    // first transaction is the action queue
    const decoded = decode(
        savedTransactions[0].data,
        "startActions",
        estforPlayerAbi
    )

    // [playerId, actions[[attire, actionId, regenId, choiceId], [], []], action queue type]
    const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
    const choiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
    return (
        actionNames[Number(actionId)] ||
        actionChoiceNames[Number(choiceId)] ||
        "Unknown"
    )
}

export const decodeSkillFromTransaction = (savedTransactions: SavedTransaction[]) => {
    if (savedTransactions.length === 0) {
        return "No action"
    }

    // first transaction is the action queue
    const decoded = decode(
        savedTransactions[0].data,
        "startActions",
        estforPlayerAbi
    )

    // [playerId, actions[[attire, actionId, regenId, choiceId], [], []], action queue type]
    
    const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
    const action = allActions.find((a) => a.actionId === Number(actionId))
    return action?.info.skill || Skill.NONE
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
                const result = await estimateGas(estimateConfig, {
                    account: getAccount(config).address,
                    to: to as `0x${string}`,
                    data: contract.encodeFunctionData("multicall", [
                        data.slice(i * actualChunks, (i + 1) * actualChunks),
                    ]) as `0x${string}`,
                    type: "legacy", // ftm is lame
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
            transactionCharge: BigInt(0),
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
                type: "legacy",
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
                type: "legacy",
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
            const emptyProxies = this.emptyProxys
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

            await this.multicall(selectorArray)
            await this.getAllProxyStates()
        },
        async multicall(data: any[], chunks = 10) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)

            if (!factoryAddress) {
                return
            }

            const factoryInterface = new Interface(factoryAbi)
            const actualChunks = await getChunksForMulticall(
                data,
                factoryAddress,
                factoryInterface,
                chunks
            )
            const splits = Math.ceil(data.length / actualChunks)
            this.totalTransactionNumber = splits
            try {
                for (let i = 0; i < splits; i++) {
                    this.currentTransactionNumber = i + 1
                    const hash = await writeContract(config, {
                        address: factoryAddress as `0x${string}`,
                        abi: factoryAbi,
                        functionName: "multicall",
                        args: [
                            data.slice(
                                i * actualChunks,
                                (i + 1) * actualChunks
                            ),
                        ],
                        type: "legacy",
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
        async approveBrush(proxys: ProxySilo[], amount: bigint) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const brushAddress = coreStore.getAddress(Address.brush)
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !brushAddress ||
                !playerNFTAddress ||
                !account.isConnected
            ) {
                return
            }

            const factoryInterface = new Interface(factoryAbi)
            const brushInterface = new Interface(brushAbi)

            const selectorArray = proxys.map((h) =>
                solidityPacked(
                    ["bytes"],
                    [
                        factoryInterface.encodeFunctionData("execute", [
                            h.address,
                            brushAddress,
                            brushInterface.encodeFunctionData("approve", [
                                playerNFTAddress,
                                amount,
                            ]),
                        ]),
                    ]
                )
            )

            await this.multicall(selectorArray)
        },
        async sendBrush(proxys: ProxySilo[], amount: bigint) {
            const coreStore = useCoreStore()
            const brushAddress = coreStore.getAddress(Address.brush)
            const account = getAccount(config)
            if (!brushAddress || !account.isConnected) {
                return
            }

            try {
                this.totalTransactionNumber = proxys.length
                this.currentTransactionNumber = 0
                for (const p of proxys) {
                    this.currentTransactionNumber++
                    const hash = await writeContract(config, {
                        address: brushAddress as `0x${string}`,
                        abi: brushAbi as any,
                        functionName: "transfer",
                        args: [p.address, amount],
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
        async evolveHeroes(proxys: ProxySilo[]) {
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

            const selectorArray = proxys.map((h) =>
                solidityPacked(
                    ["bytes"],
                    [
                        factoryInterface.encodeFunctionData("execute", [
                            h.address,
                            playerNFTAddress,
                            playerNFTInterface.encodeFunctionData(
                                "editPlayer",
                                [
                                    h.playerId,
                                    h.playerState.name,
                                    "",
                                    "",
                                    "",
                                    true,
                                ]
                            ),
                        ]),
                    ]
                )
            )

            await this.multicall(selectorArray)
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
            } else {
                this.proxys = proxysWithPlayerId.map((p) => ({
                    ...p,
                    queuedActions: [],
                    savedTransactions: [],
                    isPaused: true,
                }))
            }

            await this.getBankItems()
            await this.getTransactionCharge()    
            this.initialised = true
            this.initialisedAt = new Date()
        },
        async getTransactionCharge() {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            if (!factoryAddress) {
                return
            }

            const result = await readContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "transactionCharge",
                args: [],
            })
            this.transactionCharge = result as bigint
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
                        type: "legacy",
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
        },
        async assignActionToProxy(
            proxys: ProxySilo[],
            actionId: number,
            choiceId: number,
            head: number | undefined,
            neck: number | undefined,
            body: number | undefined,
            arms: number | undefined,
            legs: number | undefined,
            feet: number | undefined,            
            rightHand: number | undefined,
            leftHand: number | undefined,            
            food: number | undefined,
            combatStyle: CombatStyle,
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

            const selectorArray = proxys.map((h) =>
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
                                        head,
                                        neck,
                                        body,
                                        arms,
                                        legs,
                                        feet,
                                        food,
                                        leftHand,
                                        rightHand,
                                        combatStyle
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

            await this.multicall(combined, 40)

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
                                        head,
                                        neck,
                                        body,
                                        arms,
                                        legs,
                                        feet,
                                        food,
                                        leftHand,
                                        rightHand,
                                        combatStyle
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

                await this.multicall(selectorArray, 40)
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

            const broochStore = useBroochStore()
            const hasRubyBrooch = broochStore.brooches.some(
                (i) => i.tokenId === 1 && i.balance > 0
            )

            const factoryInterface = new Interface(factoryAbi)

            if (hasRubyBrooch) {
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

                await this.multicall(selectorArray, 40)
            } else {
                // execute one by one
                this.totalTransactionNumber = proxys.length
                try {
                    for (let i = 0; i < proxys.length; i++) {
                        this.currentTransactionNumber = i + 1
                        const hash = await writeContract(config, {
                            address: factoryAddress as `0x${string}`,
                            abi: factoryAbi,
                            functionName: "executeSavedTransactions",
                            args: [proxys[i].address],
                            type: "legacy",
                            value: this.transactionCharge,
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
            await sleep(2000)
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
                type: "legacy",
            })
            await waitForTransactionReceipt(config, { hash })
            await this.getBankItems()
        },
        async getRelevantItemsForProxies(proxys: ProxySilo[]) {
            const itemResultPromises = proxys
                .filter((p) => p.address !== this.bank?.address)
                .map((p) => getUserItemNFTs(p.address, []))
            const results = await Promise.all(itemResultPromises)
            const distinctItems: number[] = []

            for (const result of results.filter(
                (r) => r.userItemNFTs.length > 0
            )) {
                for (const item of result.userItemNFTs) {
                    if (!distinctItems.includes(item.tokenId)) {
                        distinctItems.push(item.tokenId)
                    }
                }
            }

            const relevantTokenIds: number[] = []
            for (const proxy of proxys) {
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
            }
            return { relevantTokenIds, distinctItems }
        },
        async transferItemsToBank(
            relevantTokenIds: number[],
            proxys: ProxySilo[]
        ) {
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

            const itemResultPromises = proxys
                .filter((p) => p.address !== this.bank?.address)
                .map((p) => getUserItemNFTs(p.address, []))
            const results = await Promise.all(itemResultPromises)

            // match proxy on item result user address and work out the outputs from the decoded saved transaction
            const deposits: { items: UserItemNFT[]; proxy: string }[] = []
            for (const result of results.filter(
                (r) => r.userItemNFTs.length > 0
            )) {
                const proxy = proxys.find(
                    (p) => p.address === result.userItemNFTs[0].user
                )
                if (!proxy) {
                    continue
                }

                for (const item of result.userItemNFTs.filter((i) =>
                    relevantTokenIds.includes(i.tokenId)
                ).filter((i) => !proxyNeedsItem(i, proxy))) {
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
                this.multicall(selectorArray, 50)
            }
            await sleep(2000)
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
                type: "legacy",
            })
            await waitForTransactionReceipt(config, { hash })
            await this.getBankItems()
        },
        async distributeItems(
            items: {
                address: string
                tokenId: number
                amount: string
            }[]
        ) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT)
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const account = getAccount(config)
            if (!factoryAddress || !itemAddress || !account.isConnected) {
                return
            }

            const factoryInterface = new Interface(factoryAbi)
            const itemInterface = new Interface(itemNFTAbi)
            const fromAddress = this.bank?.address

            const selectorArray = items.map((i) =>
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
                                    [i.tokenId],
                                    [i.amount],
                                    solidityPacked(["bytes"], ["0x"]),
                                ]
                            ),
                        ]),
                    ]
                )
            )

            await this.multicall(selectorArray, 40)
            await sleep(2000)
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
