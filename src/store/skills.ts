import { ActionChoiceInput, ActionInput, Skill } from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allActions } from '../data/actions'
import { useCoreStore } from "./core"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { allActionChoicesAlchemy, allActionChoicesCooking, allActionChoicesCrafting, allActionChoicesFiremaking, allActionChoicesFletching, allActionChoicesForging, allActionChoicesSmithing } from "../data/actionChoices"

export interface SkillState {
    woodcutting: ActionInput[],
    mining: ActionInput[],
    fishing: ActionInput[],
    cooking: ActionChoiceInput[],
    crafting: ActionChoiceInput[],
    smithing: ActionChoiceInput[],
    firemaking: ActionChoiceInput[],
    alchemy: ActionChoiceInput[],
    forging: ActionChoiceInput[],
    fletching: ActionChoiceInput[],
    thieving: ActionInput[],
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

export const actionChoiceNames = {
    // taken from the outputTokenId in each object from  ../data/actionChoices
    [EstforConstants.ASH]: "Ash",
    [EstforConstants.BRONZE_BAR]: "Bronze Bar",    
    [EstforConstants.BRONZE_HELMET]: "Bronze Helmet",
    [EstforConstants.BRONZE_ARMOR]: "Bronze Armor",
    [EstforConstants.BRONZE_GAUNTLETS]: "Bronze Gauntlets",
    [EstforConstants.BRONZE_TASSETS]: "Bronze Tassets",
    [EstforConstants.BRONZE_BOOTS]: "Bronze Boots",
    [EstforConstants.BRONZE_SWORD]: "Bronze Sword",
    [EstforConstants.BRONZE_SHIELD]: "Bronze Shield",
    [EstforConstants.BRONZE_ARROW_HEAD]: "Bronze Arrow Head",
    [EstforConstants.BRONZE_ARROW]: "Bronze Arrow",
    [EstforConstants.BRONZE_AXE]: "Bronze Axe",
    [EstforConstants.BRONZE_PICKAXE]: "Bronze Pickaxe",

    [EstforConstants.IRON_BAR]: "Iron Bar",    
    [EstforConstants.IRON_HELMET]: "Iron Helmet",
    [EstforConstants.IRON_ARMOR]: "Iron Armor",
    [EstforConstants.IRON_GAUNTLETS]: "Iron Gauntlets",
    [EstforConstants.IRON_TASSETS]: "Iron Tassets",
    [EstforConstants.IRON_BOOTS]: "Iron Boots",
    [EstforConstants.IRON_SWORD]: "Iron Sword",
    [EstforConstants.IRON_SHIELD]: "Iron Shield",
    [EstforConstants.IRON_ARROW_HEAD]: "Iron Arrow Head",
    [EstforConstants.IRON_ARROW]: "Iron Arrow",
    [EstforConstants.IRON_AXE]: "Iron Axe",
    [EstforConstants.IRON_PICKAXE]: "Iron Pickaxe",

    [EstforConstants.MITHRIL_BAR]: "Mithril Bar",    
    [EstforConstants.MITHRIL_HELMET]: "Mithril Helmet",
    [EstforConstants.MITHRIL_ARMOR]: "Mithril Armor",
    [EstforConstants.MITHRIL_GAUNTLETS]: "Mithril Gauntlets",
    [EstforConstants.MITHRIL_TASSETS]: "Mithril Tassets",
    [EstforConstants.MITHRIL_BOOTS]: "Mithril Boots",
    [EstforConstants.MITHRIL_SWORD]: "Mithril Sword",
    [EstforConstants.MITHRIL_SHIELD]: "Mithril Shield",
    [EstforConstants.MITHRIL_ARROW_HEAD]: "Mithril Arrow Head",
    [EstforConstants.MITHRIL_ARROW]: "Mithril Arrow",
    [EstforConstants.MITHRIL_AXE]: "Mithril Axe",
    [EstforConstants.MITHRIL_PICKAXE]: "Mithril Pickaxe",

    [EstforConstants.ADAMANTINE_BAR]: "Adamantine Bar",    
    [EstforConstants.ADAMANTINE_HELMET]: "Adamantine Helmet",
    [EstforConstants.ADAMANTINE_ARMOR]: "Adamantine Armor",
    [EstforConstants.ADAMANTINE_GAUNTLETS]: "Adamantine Gauntlets",
    [EstforConstants.ADAMANTINE_TASSETS]: "Adamantine Tassets",
    [EstforConstants.ADAMANTINE_BOOTS]: "Adamantine Boots",
    [EstforConstants.ADAMANTINE_SWORD]: "Adamantine Sword",
    [EstforConstants.ADAMANTINE_SHIELD]: "Adamantine Shield",
    [EstforConstants.ADAMANTINE_ARROW_HEAD]: "Adamantine Arrow Head",
    [EstforConstants.ADAMANTINE_ARROW]: "Adamantine Arrow",
    [EstforConstants.ADAMANTINE_AXE]: "Adamantine Axe",
    [EstforConstants.ADAMANTINE_PICKAXE]: "Adamantine Pickaxe",

    [EstforConstants.RUNITE_BAR]: "Runite Bar",    
    [EstforConstants.RUNITE_HELMET]: "Runite Helmet",
    [EstforConstants.RUNITE_ARMOR]: "Runite Armor",
    [EstforConstants.RUNITE_GAUNTLETS]: "Runite Gauntlets",
    [EstforConstants.RUNITE_TASSETS]: "Runite Tassets",
    [EstforConstants.RUNITE_BOOTS]: "Runite Boots",
    [EstforConstants.RUNITE_SWORD]: "Runite Sword",
    [EstforConstants.RUNITE_SHIELD]: "Runite Shield",
    [EstforConstants.RUNITE_ARROW_HEAD]: "Runite Arrow Head",
    [EstforConstants.RUNITE_ARROW]: "Runite Arrow",
    [EstforConstants.RUNITE_AXE]: "Runite Axe",
    [EstforConstants.RUNITE_PICKAXE]: "Runite Pickaxe",

    [EstforConstants.TITANIUM_BAR]: "Titanium Bar",    
    [EstforConstants.TITANIUM_HELMET]: "Titanium Helmet",
    [EstforConstants.TITANIUM_ARMOR]: "Titanium Armor",
    [EstforConstants.TITANIUM_GAUNTLETS]: "Titanium Gauntlets",
    [EstforConstants.TITANIUM_TASSETS]: "Titanium Tassets",
    [EstforConstants.TITANIUM_BOOTS]: "Titanium Boots",
    [EstforConstants.TITANIUM_SWORD]: "Titanium Sword",
    [EstforConstants.TITANIUM_SHIELD]: "Titanium Shield",
    [EstforConstants.TITANIUM_ARROW_HEAD]: "Titanium Arrow Head",
    [EstforConstants.TITANIUM_ARROW]: "Titanium Arrow",
    [EstforConstants.TITANIUM_AXE]: "Titanium Axe",
    [EstforConstants.TITANIUM_PICKAXE]: "Titanium Pickaxe",

    [EstforConstants.ORICHALCUM_BAR]: "Oricalcum Bar",    
    [EstforConstants.ORICHALCUM_HELMET]: "Oricalcum Helmet",
    [EstforConstants.ORICHALCUM_ARMOR]: "Oricalcum Armor",
    [EstforConstants.ORICHALCUM_GAUNTLETS]: "Oricalcum Gauntlets",
    [EstforConstants.ORICHALCUM_TASSETS]: "Oricalcum Tassets",
    [EstforConstants.ORICHALCUM_BOOTS]: "Oricalcum Boots",
    [EstforConstants.ORICHALCUM_SWORD]: "Oricalcum Sword",
    [EstforConstants.ORICHALCUM_SHIELD]: "Oricalcum Shield",
    [EstforConstants.ORICHALCUM_ARROW_HEAD]: "Oricalcum Arrow Head",
    [EstforConstants.ORICHALCUM_ARROW]: "Oricalcum Arrow",
    [EstforConstants.ORICHALCUM_AXE]: "Oricalcum Axe",
    [EstforConstants.ORICHALCUM_PICKAXE]: "Oricalcum Pickaxe",

    [EstforConstants.COOKED_MINNUS]: "Cooked Minnus",
    [EstforConstants.COOKED_BLEKK]: "Cooked Blekk",
    [EstforConstants.COOKED_SKRIMP]: "Cooked Skrimp",
    [EstforConstants.COOKED_FEOLA]: "Cooked Feola",
    [EstforConstants.COOKED_ANCHO]: "Cooked Ancho",
    [EstforConstants.COOKED_TROUT]: "Cooked Trout",
    [EstforConstants.COOKED_ROJJA]: "Cooked Rojja",
    [EstforConstants.COOKED_BOWFISH]: "Cooked Bowfish",
    [EstforConstants.COOKED_GOLDFISH]: "Cooked Goldfish",
    [EstforConstants.COOKED_MYSTY_BLUE]: "Cooked Mysty Blue",
    [EstforConstants.COOKED_FLITFISH]: "Cooked Flitfish",
    [EstforConstants.COOKED_RAZORFISH]: "Cooked Razorfish",
    [EstforConstants.COOKED_QUAFFER]: "Cooked Quaffer",
    [EstforConstants.COOKED_ROXA]: "Cooked Roxa",
    [EstforConstants.COOKED_AZACUDDA]: "Cooked Azacudda",
    [EstforConstants.COOKED_STONECLAW]: "Cooked Stoneclaw",
    [EstforConstants.COOKED_CRUSKAN]: "Cooked Cruskan",
    [EstforConstants.COOKED_CHODFISH]: "Cooked Chodfish",
    [EstforConstants.COOKED_DOUBTFISH]: "Cooked Doubtfish",
    [EstforConstants.COOKED_ROSEFIN]: "Cooked Rosefin",

    [EstforConstants.ARROW_SHAFT]: "Arrow Shaft",
    [EstforConstants.BASIC_BOW]: "Basic Bow",
    [EstforConstants.BONE_BOW]: "Bone Bow",
    [EstforConstants.EXPERT_BOW]: "Expert Bow",
    [EstforConstants.SPECTRAL_BOW]: "Spectral Bow",
    [EstforConstants.ICY_BOW]: "Icy Bow",
    [EstforConstants.GLITTERING_BOW]: "Glittering Bow",

    [EstforConstants.TINY_ELIXIUM]: "Tiny Elixium",
    [EstforConstants.SMALL_ELIXIUM]: "Small Elixium",
    [EstforConstants.MEDIUM_ELIXIUM]: "Medium Elixium",
    [EstforConstants.LARGE_ELIXIUM]: "Large Elixium",

    [EstforConstants.PAPER]: "Paper",
    [EstforConstants.SHADOW_SCROLL]: "Shadow Scroll",
    [EstforConstants.NATURE_SCROLL]: "Nature Scroll",
    [EstforConstants.AQUA_SCROLL]: "Aqua Scroll",
    [EstforConstants.HELL_SCROLL]: "Hell Scroll",
    [EstforConstants.AIR_SCROLL]: "Air Scroll",
    [EstforConstants.BARRAGE_SCROLL]: "Barrage Scroll",
    [EstforConstants.FREEZE_SCROLL]: "Freeze Scroll",
    [EstforConstants.ANCIENT_SCROLL]: "Ancient Scroll",

    [EstforConstants.BONEMEAL]: "Bonemeal",
    [EstforConstants.ROPE]: "Rope",
    [EstforConstants.ACORN_PATCH]: "Acorn Patch",
    [EstforConstants.BAT_WING_PATCH]: "Bat Wing Patch",
    [EstforConstants.NATUOW_LEATHER]: "Natuow Leather",
    [EstforConstants.NATUOW_BODY]: "Natuow Body",
    [EstforConstants.NATUOW_BRACERS]: "Natuow Bracers",
    [EstforConstants.NATUOW_BOOTS]: "Natuow Boots",
    [EstforConstants.NATUOW_HOOD]: "Natuow Hood",
    [EstforConstants.NATUOW_TASSETS]: "Natuow Tassets",

    [EstforConstants.BAT_WING_BODY]: "Bat Wing Body",
    [EstforConstants.BAT_WING_BRACERS]: "Bat Wing Bracers",
    [EstforConstants.BAT_WING_HAT]: "Bat Wing Hat",
    [EstforConstants.BAT_WING_BOOTS]: "Bat Wing Boots",
    [EstforConstants.BAT_WING_TROUSERS]: "Bat Wing Trousers",

    [EstforConstants.NATURE_BODY]: "Nature Body",
    [EstforConstants.NATURE_BRACERS]: "Nature Bracers",
    [EstforConstants.NATURE_MASK]: "Nature Mask",
    [EstforConstants.NATURE_BOOTS]: "Nature Boots",
    [EstforConstants.NATURE_TROUSERS]: "Nature Trousers",

    [EstforConstants.TOTEM_STAFF]: "Totem Staff",
    [EstforConstants.SAPPHIRE_STAFF]: "Sapphire Staff",
    [EstforConstants.EMERALD_STAFF]: "Emerald Staff",
    [EstforConstants.RUBY_STAFF]: "Ruby Staff",
    [EstforConstants.DIAMOND_STAFF]: "Diamond Staff",
    [EstforConstants.AMETHYST_STAFF]: "Amethyst Staff",

    [EstforConstants.SAPPHIRE_AMULET]: "Sapphire Amulet",
    [EstforConstants.EMERALD_AMULET]: "Emerald Amulet",
    [EstforConstants.RUBY_AMULET]: "Ruby Amulet",
    [EstforConstants.DIAMOND_AMULET]: "Diamond Amulet",
    [EstforConstants.AMETHYST_AMULET]: "Amethyst Amulet",
    [EstforConstants.DRAGONSTONE_AMULET]: "Dragonstone Amulet",

    [EstforConstants.APPRENTICE_BODY]: "Apprentice Body",
    [EstforConstants.APPRENTICE_GAUNTLETS]: "Apprentice Gauntlets",
    [EstforConstants.APPRENTICE_HAT]: "Apprentice Hat",
    [EstforConstants.APPRENTICE_BOOTS]: "Apprentice Boots",
    [EstforConstants.APPRENTICE_TROUSERS]: "Apprentice Trousers",

    [EstforConstants.MAGE_BODY]: "Mage Body",
    [EstforConstants.MAGE_BRACERS]: "Mage Bracers",
    [EstforConstants.MAGE_HOOD]: "Mage Hood",
    [EstforConstants.MAGE_BOOTS]: "Mage Boots",
    [EstforConstants.MAGE_TROUSERS]: "Mage Trousers",

    [EstforConstants.SHAMAN_BODY]: "Shaman Body",
    [EstforConstants.SHAMAN_GAUNTLETS]: "Shaman Gauntlets",
    [EstforConstants.SHAMAN_HOOD]: "Shaman Hood",
    [EstforConstants.SHAMAN_BOOTS]: "Shaman Boots",
    [EstforConstants.SHAMAN_TROUSERS]: "Shaman Trousers",

    [EstforConstants.SEERS_BODY]: "Seers Body",
    [EstforConstants.SEERS_BRACERS]: "Seers Bracers",
    [EstforConstants.SEERS_HOOD]: "Seers Hood",
    [EstforConstants.SEERS_BOOTS]: "Seers Boots",
    [EstforConstants.SEERS_TROUSERS]: "Seers Trousers",

    [EstforConstants.SORCERER_BODY]: "Sorcerer Body",
    [EstforConstants.SORCERER_GAUNTLETS]: "Sorcerer Gauntlets",
    [EstforConstants.SORCERER_HAT]: "Sorcerer Hat",
    [EstforConstants.SORCERER_BOOTS]: "Sorcerer Boots",
    [EstforConstants.SORCERER_TROUSERS]: "Sorcerer Trousers",

    [EstforConstants.MASTER_BODY]: "Master Body",
    [EstforConstants.MASTER_BRACERS]: "Master Bracers",
    [EstforConstants.MASTER_HAT]: "Master Hat",
    [EstforConstants.MASTER_BOOTS]: "Master Boots",
    [EstforConstants.MASTER_TROUSERS]: "Master Trousers",

    [EstforConstants.AZAMITE_BODY]: "Azamite Body",
    [EstforConstants.AZAMITE_BRACERS]: "Azamite Bracers",
    [EstforConstants.AZAMITE_CHAPS]: "Azamite Chaps",
    [EstforConstants.AZAMITE_BOOTS]: "Azamite Boots",
    [EstforConstants.AZAMITE_COWL]: "Azamite Cowl",

    [EstforConstants.HAUBERK_BODY]: "Hauberk Body",
    [EstforConstants.HAUBERK_BRACERS]: "Hauberk Bracers",
    [EstforConstants.HAUBERK_CHAPS]: "Hauberk Chaps",
    [EstforConstants.HAUBERK_BOOTS]: "Hauberk Boots",
    [EstforConstants.HAUBERK_COWL]: "Hauberk Cowl",

    [EstforConstants.GARAGOS_BODY]: "Garagos Body",
    [EstforConstants.GARAGOS_BRACERS]: "Garagos Bracers",
    [EstforConstants.GARAGOS_CHAPS]: "Garagos Chaps",
    [EstforConstants.GARAGOS_BOOTS]: "Garagos Boots",
    [EstforConstants.GARAGOS_COWL]: "Garagos Cowl",

    [EstforConstants.ETERNAL_BODY]: "Eternal Body",
    [EstforConstants.ETERNAL_BRACERS]: "Eternal Bracers",
    [EstforConstants.ETERNAL_CHAPS]: "Eternal Chaps",
    [EstforConstants.ETERNAL_BOOTS]: "Eternal Boots",
    [EstforConstants.ETERNAL_COWL]: "Eternal Cowl",

    [EstforConstants.REAVER_BODY]: "Reaver Body",
    [EstforConstants.REAVER_BRACERS]: "Reaver Bracers",
    [EstforConstants.REAVER_CHAPS]: "Reaver Chaps",
    [EstforConstants.REAVER_BOOTS]: "Reaver Boots",
    [EstforConstants.REAVER_COWL]: "Reaver Cowl",
}

export const actionNames = {
    // taken from the actionId in allActions from  ../data/actions.ts
    [EstforConstants.ACTION_WOODCUTTING_LOG]: "Ash",
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
    minXP: number,
    xpPerHour: number,
    actionId: number,
    name: string,
}

export interface RelevantAction {
    currentAction: RelevantActionInput,
    nextAction: RelevantActionInput | undefined,
    currentXPForSkill: number,
}

export const useSkillStore = defineStore({
    id: "skills",
    state: () =>
        ({
            woodcutting: allActions.filter(x => x.info.skill === Skill.WOODCUTTING) as ActionInput[],
            mining: allActions.filter(x => x.info.skill === Skill.MINING) as ActionInput[],
            fishing: allActions.filter(x => x.info.skill === Skill.FISHING) as ActionInput[],
            cooking: allActionChoicesCooking,
            crafting: allActionChoicesCrafting,
            smithing: allActionChoicesSmithing,
            firemaking: allActionChoicesFiremaking,
            alchemy: allActionChoicesAlchemy,
            forging: allActionChoicesForging,
            fletching: allActionChoicesFletching,
            thieving: allActions.filter(x => x.info.skill === Skill.THIEVING) as ActionInput[],
        } as SkillState),
    getters: {
        getCurrentAndNextActionForSkill: (state: SkillState) => {
            return (skill: Skill): RelevantAction => {
                let inputChoices: ActionChoiceInput[] = []
                let inputs: ActionInput[] = []
                let isActionChoice = false
                const coreStore = useCoreStore()
                const playerState = coreStore.playerState
                let currentXPForSkill = 1
                switch (skill) {
                    case Skill.WOODCUTTING:
                        inputs = state.woodcutting
                        currentXPForSkill = playerState.woodcuttingXP
                        break
                    case Skill.MINING:
                        inputs = state.mining
                        currentXPForSkill = playerState.miningXP
                        break
                    case Skill.FISHING:
                        inputs = state.fishing
                        currentXPForSkill = playerState.fishingXP
                        break
                    case Skill.COOKING:
                        inputChoices = state.cooking
                        currentXPForSkill = playerState.cookingXP
                        isActionChoice = true
                        break
                    case Skill.CRAFTING:
                        inputChoices = state.crafting
                        currentXPForSkill = playerState.craftingXP
                        isActionChoice = true
                        break
                    case Skill.SMITHING:
                        inputChoices = state.smithing
                        currentXPForSkill = playerState.smithingXP
                        isActionChoice = true
                        break
                    case Skill.FIREMAKING:
                        inputChoices = state.firemaking
                        currentXPForSkill = playerState.firemakingXP
                        isActionChoice = true
                        break
                    case Skill.ALCHEMY:
                        inputChoices = state.alchemy
                        currentXPForSkill = playerState.alchemyXP
                        isActionChoice = true
                        break
                    case Skill.FORGING:
                        inputChoices = state.forging
                        currentXPForSkill = playerState.forgingXP
                        isActionChoice = true
                        break
                    case Skill.FLETCHING:
                        inputChoices = state.fletching
                        currentXPForSkill = playerState.fletchingXP
                        isActionChoice = true
                        break
                    case Skill.THIEVING:
                        inputs = state.thieving
                        currentXPForSkill = playerState.thievingXP
                        break
                }

                let currentAction: RelevantActionInput = {
                    minXP: 0,
                    xpPerHour: 0,
                    actionId: 0,
                    name: '',
                }
                let nextAction: RelevantActionInput | undefined

                if (!isActionChoice) {
                    inputs.sort((a, b) => {
                        if (b.info.xpPerHour > a.info.xpPerHour)
                            return -1
                        if (b.info.xpPerHour < a.info.xpPerHour)
                            return 1
                        return 0
                    })

                    currentAction = {
                        minXP: inputs[0].info.minXP,
                        xpPerHour: inputs[0].info.xpPerHour,
                        actionId: inputs[0].actionId,
                        name: actionNames[inputs[0].actionId],
                    }
                    const availableActionsToPlayer = inputs.filter(x => x.info.minXP <= currentXPForSkill)
                    if (availableActionsToPlayer.length > 0) {
                        const lastAction = availableActionsToPlayer[availableActionsToPlayer.length - 1]
                        currentAction.minXP = lastAction.info.minXP
                        currentAction.xpPerHour = lastAction.info.xpPerHour
                        currentAction.actionId = lastAction.actionId
                        currentAction.name = actionNames[lastAction.actionId]
                    }
                    const nextActionIndex = inputs.findIndex(x => x.info.minXP > currentAction.minXP && x.info.xpPerHour > currentAction.xpPerHour)
                    if (nextActionIndex > -1) {
                        nextAction = {
                            minXP: inputs[nextActionIndex].info.minXP,
                            xpPerHour: inputs[nextActionIndex].info.xpPerHour,
                            actionId: inputs[nextActionIndex].actionId,
                            name: actionNames[inputs[nextActionIndex].actionId],
                        }
                    }
                } else {
                    inputChoices.sort((a, b) => {
                        if (b.xpPerHour > a.xpPerHour)
                            return -1
                        if (b.xpPerHour < a.xpPerHour)
                            return 1
                        return 0
                    })

                    currentAction = {
                        minXP: inputChoices[0].minXPs[0],
                        xpPerHour: inputChoices[0].xpPerHour,
                        actionId: inputChoices[0].outputTokenId,
                        name: actionChoiceNames[inputChoices[0].outputTokenId],               
                    }                    

                    const availableActionsToPlayer = inputChoices.filter(x => x.minXPs.every((y, i) => y <= currentXPForSkill && x.minSkills[i] === skill))
                    if (availableActionsToPlayer.length > 0) {
                        const lastAction = availableActionsToPlayer[availableActionsToPlayer.length - 1]
                        currentAction.minXP = lastAction.minXPs[lastAction.minSkills.findIndex(x => x === lastAction.skill)] || 0
                        currentAction.xpPerHour = lastAction.xpPerHour
                        currentAction.actionId = lastAction.outputTokenId
                        currentAction.name = actionChoiceNames[lastAction.outputTokenId]
                    }
                    const nextActionIndex = inputChoices.findIndex(x => x.minXPs.some((y, i) => y > currentAction.minXP && x.minSkills[i] === skill) && x.xpPerHour > currentAction.xpPerHour)
                    if (nextActionIndex > -1) {
                        nextAction = {
                            minXP: inputChoices[nextActionIndex].minXPs[inputChoices[nextActionIndex].minSkills.findIndex(x => x === skill)] || 0,
                            xpPerHour: inputChoices[nextActionIndex].xpPerHour,
                            actionId: inputChoices[nextActionIndex].outputTokenId,
                            name: actionChoiceNames[inputChoices[nextActionIndex].outputTokenId],
                        }
                    }
                }
                return { currentAction, nextAction, currentXPForSkill }
            }
        },
    },
    actions: {
    },
})