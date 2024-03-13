import {
    ActionChoiceInput,
    ActionInput,
    Skill,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allActions } from "../data/actions"
import { useCoreStore } from "./core"
import { EstforConstants } from "@paintswap/estfor-definitions"
import {
    allActionChoicesAlchemy,
    allActionChoicesCooking,
    allActionChoicesCrafting,
    allActionChoicesFiremaking,
    allActionChoicesFletching,
    allActionChoicesForging,
    allActionChoicesSmithing,
} from "../data/actionChoices"
import { itemNames, useItemStore } from "./items"

export interface SkillState {
    woodcutting: ActionInput[]
    mining: ActionInput[]
    fishing: ActionInput[]
    cooking: ActionChoiceInput[]
    crafting: ActionChoiceInput[]
    smithing: ActionChoiceInput[]
    firemaking: ActionChoiceInput[]
    alchemy: ActionChoiceInput[]
    forging: ActionChoiceInput[]
    fletching: ActionChoiceInput[]
    thieving: ActionInput[]
}

export const skillNames = {
    [Skill.WOODCUTTING]: "Woodcutting",
    [Skill.MINING]: "Mining",
    [Skill.FISHING]: "Fishing",
    [Skill.COOKING]: "Cooking",
    [Skill.CRAFTING]: "Crafting",
    [Skill.SMITHING]: "Smithing",
    [Skill.FIREMAKING]: "Firemaking",
    [Skill.ALCHEMY]: "Alchemy",
    [Skill.FORGING]: "Forging",
    [Skill.FLETCHING]: "Fletching",
    [Skill.THIEVING]: "Thieving",
    [Skill.NONE]: "None",
    [Skill.COMBAT]: "Combat",
    [Skill.DEFENCE]: "Defence",
    [Skill.MELEE]: "Melee",
    [Skill.MAGIC]: "Magic",
    [Skill.RANGED]: "Ranged",
    [Skill.HEALTH]: "Health",
    [Skill.AGILITY]: "Agility",
    [Skill.HUNTING]: "Hunting",
    [Skill.TRAVELING]: "Traveling",
    [Skill.RESERVED_COMBAT]: "Reserved Combat",
    [Skill.RESERVED3]: "Reserved 3",
    [Skill.RESERVED4]: "Reserved 4",
    [Skill.RESERVED5]: "Reserved 5",
    [Skill.RESERVED6]: "Reserved 6",
    [Skill.RESERVED7]: "Reserved 7",
    [Skill.RESERVED8]: "Reserved 8",
    [Skill.RESERVED9]: "Reserved 9",
    [Skill.RESERVED10]: "Reserved 10",
    [Skill.RESERVED11]: "Reserved 11",
    [Skill.RESERVED12]: "Reserved 12",
    [Skill.RESERVED13]: "Reserved 13",
    [Skill.RESERVED14]: "Reserved 14",
    [Skill.RESERVED15]: "Reserved 15",
    [Skill.RESERVED16]: "Reserved 16",
    [Skill.RESERVED17]: "Reserved 17",
    [Skill.RESERVED18]: "Reserved 18",
    [Skill.RESERVED19]: "Reserved 19",
    [Skill.RESERVED20]: "Reserved 20",
}

export const actionNames = {
    // taken from the actionId in allActions from  ../data/actions.ts
    [EstforConstants.ACTION_WOODCUTTING_LOG]: "Log",
    [EstforConstants.ACTION_WOODCUTTING_OAK]: "Oak",
    [EstforConstants.ACTION_WOODCUTTING_WILLOW]: "Willow",
    [EstforConstants.ACTION_WOODCUTTING_MAPLE]: "Maple",
    [EstforConstants.ACTION_WOODCUTTING_REDWOOD]: "Redwood",
    [EstforConstants.ACTION_WOODCUTTING_MAGICAL]: "Magical",
    [EstforConstants.ACTION_WOODCUTTING_ASH]: "Ash",
    [EstforConstants.ACTION_WOODCUTTING_ENCHANTED]: "Enchanted",
    [EstforConstants.ACTION_WOODCUTTING_LIVING]: "Living",

    [EstforConstants.ACTION_MINING_COPPER]: "Copper",
    [EstforConstants.ACTION_MINING_TIN]: "Tin",
    [EstforConstants.ACTION_MINING_IRON]: "Iron",
    [EstforConstants.ACTION_MINING_COAL]: "Coal",
    [EstforConstants.ACTION_MINING_SAPPHIRE]: "Sapphire",
    [EstforConstants.ACTION_MINING_EMERALD]: "Emerald",
    [EstforConstants.ACTION_MINING_RUBY]: "Ruby",
    [EstforConstants.ACTION_MINING_DIAMOND]: "Diamond",
    [EstforConstants.ACTION_MINING_AMETHYST]: "Amethyst",
    [EstforConstants.ACTION_MINING_DRAGONSTONE]: "Dragonstone",
    [EstforConstants.ACTION_MINING_MITHRIL]: "Mithril",
    [EstforConstants.ACTION_MINING_ADAMANTINE]: "Adamantine",
    [EstforConstants.ACTION_MINING_RUNITE]: "Runite",
    [EstforConstants.ACTION_MINING_TITANIUM]: "Titanium",
    [EstforConstants.ACTION_MINING_ORICHALCUM]: "Orichalcum",

    [EstforConstants.ACTION_FISHING_MINNUS]: "Minnus",
    [EstforConstants.ACTION_FISHING_BLEKK]: "Blekk",
    [EstforConstants.ACTION_FISHING_SKRIMP]: "Skrimp",
    [EstforConstants.ACTION_FISHING_FEOLA]: "Feola",
    [EstforConstants.ACTION_FISHING_ANCHO]: "Ancho",
    [EstforConstants.ACTION_FISHING_TROUT]: "Trout",
    [EstforConstants.ACTION_FISHING_ROJJA]: "Rojja",
    [EstforConstants.ACTION_FISHING_BOWFISH]: "Bowfish",
    [EstforConstants.ACTION_FISHING_GOLDFISH]: "Goldfish",
    [EstforConstants.ACTION_FISHING_MYSTY_BLUE]: "Mysty Blue",
    [EstforConstants.ACTION_FISHING_FLITFISH]: "Flitfish",
    [EstforConstants.ACTION_FISHING_RAZORFISH]: "Razorfish",
    [EstforConstants.ACTION_FISHING_QUAFFER]: "Quaffer",
    [EstforConstants.ACTION_FISHING_ROXA]: "Roxa",
    [EstforConstants.ACTION_FISHING_AZACUDDA]: "Azacudda",
    [EstforConstants.ACTION_FISHING_STONECLAW]: "Stoneclaw",
    [EstforConstants.ACTION_FISHING_CRUSKAN]: "Cruskan",
    [EstforConstants.ACTION_FISHING_CHODFISH]: "Chodfish",
    [EstforConstants.ACTION_FISHING_DOUBTFISH]: "Doubtfish",
    [EstforConstants.ACTION_FISHING_ROSEFIN]: "Rosefin",

    [EstforConstants.ACTION_THIEVING_CHILD]: "Child",
    [EstforConstants.ACTION_THIEVING_MAN]: "Man",
    [EstforConstants.ACTION_THIEVING_GUARD]: "Guard",
    [EstforConstants.ACTION_THIEVING_CHEST]: "Chest",
    [EstforConstants.ACTION_THIEVING_STALL]: "Stall",
    [EstforConstants.ACTION_THIEVING_FARMER]: "Farmer",
    [EstforConstants.ACTION_THIEVING_FISHERMAN]: "Fisherman",
    [EstforConstants.ACTION_THIEVING_LUMBERJACK]: "Lumberjack",
    [EstforConstants.ACTION_THIEVING_BLACKSMITH]: "Blacksmith",
    [EstforConstants.ACTION_THIEVING_HEAD_GUARD]: "Head Guard",
    [EstforConstants.ACTION_THIEVING_WIZARD]: "Wizard",
    [EstforConstants.ACTION_THIEVING_POTION_SHOP]: "Potion Shop",
    [EstforConstants.ACTION_THIEVING_GEM_MERCHANT]: "Gem Merchant",
    [EstforConstants.ACTION_THIEVING_BANK]: "Bank",
    [EstforConstants.ACTION_THIEVING_MASTER_THIEF]: "Master Thief",
}

export interface RelevantActionInput {
    minXP: number
    xpPerHour: number
    actionId: number
    name: string
}

export enum ActionType {
    action,
    actionChoice,
}

export interface RelevantAction {
    currentAction: RelevantActionInput
    nextAction: RelevantActionInput | undefined
    currentXPForSkill: number
    skill: Skill
    actionType: ActionType
    hasItemSearch: boolean
}

export const useSkillStore = defineStore({
    id: "skills",
    state: () =>
        ({
            woodcutting: allActions.filter(
                (x) => x.info.skill === Skill.WOODCUTTING
            ) as ActionInput[],
            mining: allActions.filter(
                (x) => x.info.skill === Skill.MINING
            ) as ActionInput[],
            fishing: allActions.filter(
                (x) => x.info.skill === Skill.FISHING
            ) as ActionInput[],
            cooking: allActionChoicesCooking,
            crafting: allActionChoicesCrafting,
            smithing: allActionChoicesSmithing,
            firemaking: allActionChoicesFiremaking,
            alchemy: allActionChoicesAlchemy,
            forging: allActionChoicesForging,
            fletching: allActionChoicesFletching,
            thieving: allActions.filter(
                (x) => x.info.skill === Skill.THIEVING
            ) as ActionInput[],
        }) as SkillState,
    getters: {
        getActionInputsForSkill: (state: SkillState) => {
            return (skill: Skill): ActionInput[] => {
                switch (skill) {
                    case Skill.WOODCUTTING:
                        return state.woodcutting
                    case Skill.MINING:
                        return state.mining
                    case Skill.FISHING:
                        return state.fishing
                    case Skill.THIEVING:
                        return state.thieving
                    default:
                        return []
                }
            }
        },
        getActionChoiceInputsForSkill: (state: SkillState) => {
            return (skill: Skill): ActionChoiceInput[] => {
                switch (skill) {
                    case Skill.COOKING:
                        return state.cooking
                    case Skill.CRAFTING:
                        return state.crafting
                    case Skill.SMITHING:
                        return state.smithing
                    case Skill.FIREMAKING:
                        return state.firemaking
                    case Skill.ALCHEMY:
                        return state.alchemy
                    case Skill.FORGING:
                        return state.forging
                    case Skill.FLETCHING:
                        return state.fletching
                    default:
                        return []
                }
            }
        },
        getCurrentAndNextActionForSkill: (state: SkillState) => {
            return (skill: Skill): RelevantAction => {
                let inputChoices: ActionChoiceInput[] = []
                let inputs: ActionInput[] = []
                let isActionChoice = false
                const coreStore = useCoreStore()
                const itemStore = useItemStore()
                const playerState = coreStore.playerState
                let currentXPForSkill = 1
                let hasItemSearch = false
                switch (skill) {
                    case Skill.WOODCUTTING:
                        inputs = state.woodcutting
                        currentXPForSkill = parseInt(
                            playerState.woodcuttingXP,
                            10
                        )
                        break
                    case Skill.MINING:
                        inputs = state.mining
                        currentXPForSkill = parseInt(playerState.miningXP, 10)
                        break
                    case Skill.FISHING:
                        inputs = state.fishing
                        currentXPForSkill = parseInt(playerState.fishingXP, 10)
                        break
                    case Skill.COOKING:
                        inputChoices = state.cooking
                        currentXPForSkill = parseInt(playerState.cookingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.CRAFTING:
                        inputChoices = state.crafting
                        currentXPForSkill = parseInt(playerState.craftingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.SMITHING:
                        inputChoices = state.smithing
                        currentXPForSkill = parseInt(playerState.smithingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.FIREMAKING:
                        inputChoices = state.firemaking
                        currentXPForSkill = parseInt(
                            playerState.firemakingXP,
                            10
                        )
                        isActionChoice = true
                        break
                    case Skill.ALCHEMY:
                        inputChoices = state.alchemy
                        currentXPForSkill = parseInt(playerState.alchemyXP, 10)
                        isActionChoice = true
                        break
                    case Skill.FORGING:
                        inputChoices = state.forging
                        currentXPForSkill = parseInt(playerState.forgingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.FLETCHING:
                        inputChoices = state.fletching
                        currentXPForSkill = parseInt(
                            playerState.fletchingXP,
                            10
                        )
                        isActionChoice = true
                        break
                    case Skill.THIEVING:
                        inputs = state.thieving
                        currentXPForSkill = parseInt(playerState.thievingXP, 10)
                        break
                }

                let currentAction: RelevantActionInput = {
                    minXP: 0,
                    xpPerHour: 0,
                    actionId: 0,
                    name: "",
                }
                let nextAction: RelevantActionInput | undefined

                if (!isActionChoice) {
                    inputs.sort((a, b) => {
                        if (b.info.xpPerHour > a.info.xpPerHour) return -1
                        if (b.info.xpPerHour < a.info.xpPerHour) return 1

                        if (b.info.minXP > a.info.minXP) return -1
                        if (b.info.minXP < a.info.minXP) return 1

                        return 0
                    })

                    currentAction = {
                        minXP: inputs[0].info.minXP,
                        xpPerHour: inputs[0].info.xpPerHour,
                        actionId: inputs[0].actionId,
                        name: actionNames[inputs[0].actionId],
                    }
                    const availableActionsToPlayer = inputs.filter(
                        (x) => x.info.minXP <= currentXPForSkill
                    )
                    if (availableActionsToPlayer.length > 0) {
                        const lastAction =
                            availableActionsToPlayer[
                                availableActionsToPlayer.length - 1
                            ]
                        currentAction.minXP = lastAction.info.minXP
                        currentAction.xpPerHour = lastAction.info.xpPerHour
                        currentAction.actionId = lastAction.actionId
                        currentAction.name = actionNames[lastAction.actionId]
                    }
                    const nextActions = inputs.filter(
                        (x) =>
                            x.info.minXP >= currentAction.minXP &&
                            x.info.xpPerHour > currentAction.xpPerHour
                    )
                    if (nextActions.length > 1) {
                        nextActions.sort((a, b) => {
                            if (b.info.minXP > a.info.minXP) return -1
                            if (b.info.minXP < a.info.minXP) return 1

                            if (b.info.xpPerHour > a.info.xpPerHour) return -1
                            if (b.info.xpPerHour < a.info.xpPerHour) return 1
                            return 0
                        })
                        nextAction = {
                            minXP: nextActions[0].info.minXP,
                            xpPerHour: nextActions[0].info.xpPerHour,
                            actionId: nextActions[0].actionId,
                            name: actionNames[nextActions[0].actionId],
                        }
                    }

                    if (
                        inputs.some(
                            (x) =>
                                x.guaranteedRewards.some(
                                    (y) =>
                                        itemNames[y.itemTokenId]
                                            ?.toLowerCase()
                                            .includes(
                                                itemStore.itemSearch.toLowerCase()
                                            )
                                ) ||
                                x.randomRewards.some(
                                    (y) =>
                                        itemNames[y.itemTokenId]
                                            ?.toLowerCase()
                                            .includes(
                                                itemStore.itemSearch.toLowerCase()
                                            )
                                ) ||
                                itemNames[x.info.handItemTokenIdRangeMax]
                                    ?.toLowerCase()
                                    .includes(
                                        itemStore.itemSearch.toLowerCase()
                                    ) ||
                                itemNames[x.info.handItemTokenIdRangeMax]
                                    ?.toLowerCase()
                                    .includes(
                                        itemStore.itemSearch.toLowerCase()
                                    )
                        )
                    ) {
                        hasItemSearch = true
                    }
                } else {
                    inputChoices.sort((a, b) => {
                        if (b.xpPerHour > a.xpPerHour) return -1
                        if (b.xpPerHour < a.xpPerHour) return 1

                        if (
                            b.minXPs[b.minSkills.indexOf(skill)] >
                            a.minXPs[b.minSkills.indexOf(skill)]
                        )
                            return -1
                        if (
                            b.minXPs[b.minSkills.indexOf(skill)] <
                            a.minXPs[b.minSkills.indexOf(skill)]
                        )
                            return 1
                        return 0
                    })

                    currentAction = {
                        minXP: inputChoices[0].minXPs[0],
                        xpPerHour: inputChoices[0].xpPerHour,
                        actionId: inputChoices[0].outputTokenId,
                        name: itemNames[inputChoices[0].outputTokenId],
                    }

                    const availableActionsToPlayer = inputChoices.filter((x) =>
                        x.minXPs.every(
                            (y, i) =>
                                y <= currentXPForSkill &&
                                x.minSkills[i] === skill
                        )
                    )
                    if (availableActionsToPlayer.length > 0) {
                        const lastAction =
                            availableActionsToPlayer[
                                availableActionsToPlayer.length - 1
                            ]
                        currentAction.minXP =
                            lastAction.minXPs[
                                lastAction.minSkills.findIndex(
                                    (x) => x === lastAction.skill
                                )
                            ] || 0
                        currentAction.xpPerHour = lastAction.xpPerHour
                        currentAction.actionId = lastAction.outputTokenId
                        currentAction.name = itemNames[lastAction.outputTokenId]
                    }
                    const nextActions = inputChoices.filter(
                        (x) =>
                            x.minXPs.some(
                                (y, i) =>
                                    y >= currentAction.minXP &&
                                    x.minSkills[i] === skill
                            ) && x.xpPerHour > currentAction.xpPerHour
                    )

                    if (nextActions.length > 0) {
                        nextActions.sort((a, b) => {
                            if (
                                b.minXPs[b.minSkills.indexOf(skill)] >
                                a.minXPs[b.minSkills.indexOf(skill)]
                            )
                                return -1
                            if (
                                b.minXPs[b.minSkills.indexOf(skill)] <
                                a.minXPs[b.minSkills.indexOf(skill)]
                            )
                                return 1

                            if (b.xpPerHour > a.xpPerHour) return -1
                            if (b.xpPerHour < a.xpPerHour) return 1
                            return 0
                        })
                        nextAction = {
                            minXP:
                                nextActions[0].minXPs[
                                    nextActions[0].minSkills.findIndex(
                                        (x) => x === skill
                                    )
                                ] || 0,
                            xpPerHour: nextActions[0].xpPerHour,
                            actionId: nextActions[0].outputTokenId,
                            name: itemNames[nextActions[0].outputTokenId],
                        }
                    }

                    if (
                        inputChoices.some(
                            (x) =>
                                x.inputTokenIds.some(
                                    (y) =>
                                        itemNames[y]
                                            ?.toLowerCase()
                                            .includes(
                                                itemStore.itemSearch.toLowerCase()
                                            )
                                ) ||
                                itemNames[x.outputTokenId]
                                    ?.toLowerCase()
                                    .includes(
                                        itemStore.itemSearch.toLowerCase()
                                    ) ||
                                itemNames[x.handItemTokenIdRangeMax]
                                    ?.toLowerCase()
                                    .includes(
                                        itemStore.itemSearch.toLowerCase()
                                    ) ||
                                itemNames[x.handItemTokenIdRangeMax]
                                    ?.toLowerCase()
                                    .includes(
                                        itemStore.itemSearch.toLowerCase()
                                    )
                        )
                    ) {
                        hasItemSearch = true
                    }
                }
                return {
                    currentAction,
                    nextAction,
                    currentXPForSkill,
                    skill,
                    actionType: isActionChoice
                        ? ActionType.actionChoice
                        : ActionType.action,
                    hasItemSearch,
                }
            }
        },
    },
    actions: {},
})
