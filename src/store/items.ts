import {
    ActionChoiceInput,
    CombatStats,
    EquipPosition,
    ItemInput,
    Skill,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allItems } from "../data/items"
import {
    allActionChoicesRanged,
    allActionChoicesMagic,
} from "../data/actionChoices"
import { getLevel, useCoreStore } from "./core"
import { EstforConstants } from "@paintswap/estfor-definitions"

const magicSpellNames = [
    "SHADOW BLAST",
    "NATURES FURY",
    "DEATH WAVE",
    "VORTEX",
    "MYSTIC BLAST",
    "MAGIC BREATH",
    "SUMMON HELL HOUND",
    "AIR BALL",
    "FURY FISTS",
    "CONCUSSION BEAMS",
    "ICE SPIKES",
]

export const itemNames = {
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
    [EstforConstants.EXTRA_LARGE_ELIXIUM]: "Extra Large Elixium",
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
    [EstforConstants.DRAGONSTONE]: "Dragonstone",

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

    [EstforConstants.SMALL_BONE]: "Small Bone",
    [EstforConstants.MEDIUM_BONE]: "Medium Bone",
    [EstforConstants.LARGE_BONE]: "Large Bone",
    [EstforConstants.DRAGON_BONE]: "Dragon Bone",

    [EstforConstants.AQUA_KEY]: "Aqua Key",
    [EstforConstants.BONE_KEY]: "Bone Key",
    [EstforConstants.DRAGON_KEY]: "Dragon Key",
    [EstforConstants.NATURE_KEY]: "Nature Key",

    [EstforConstants.STRING]: "String",
    [EstforConstants.FLIXORA]: "Flixora",
    [EstforConstants.RUFARUM]: "Rufarum",
    [EstforConstants.POISON]: "Poison",
    [EstforConstants.VENOM_POUCH]: "Venom Pouch",
    [EstforConstants.NATUOW_HIDE]: "Natuow Hide",
    [EstforConstants.LEAF_FRAGMENTS]: "Leaf Fragments",
    [EstforConstants.QUARTZ_INFUSED_FEATHER]: "Quartz Infused Feather",
    [EstforConstants.FEATHER]: "Feather",
    [EstforConstants.PAPER]: "Paper",
    [EstforConstants.BAT_WING]: "Bat Wing",
    [EstforConstants.ACORN_PATCH]: "Acorn Patch",
    [EstforConstants.BECARA_GRASS]: "Becara Grass",
    [EstforConstants.BLUECANAR]: "Bluecanar",
    [EstforConstants.DRAGON_TEETH]: "Dragon Teeth",
    [EstforConstants.HURA_ROOT]: "Hura Root",
    [EstforConstants.BARK_CHUNK]: "Bark Chunk",
    [EstforConstants.ANURGAT]: "Anurgat",
    [EstforConstants.LOSSUTH_SCALE]: "Lossuth Scale",
    [EstforConstants.LOSSUTH_TEETH]: "Lossuth Teeth",
    [EstforConstants.RIGOB_CLOTH]: "Rigob Cloth",
    [EstforConstants.FLUX]: "Flux",
    [EstforConstants.QUAVA_SILK]: "Quava Silk",
    [EstforConstants.ENCHANTED_ACORN]: "Enchanted Acorn",
    [EstforConstants.WHITE_DEATH_SPORE]: "White Death Spore",
    [EstforConstants.DRAGON_SCALE]: "Dragon Scale",

    [EstforConstants.SCORCHING_BODY]: "Scorching Body",
    [EstforConstants.SCORCHING_BRACERS]: "Scorching Bracers",
    [EstforConstants.SCORCHING_COWL]: "Scorching Cowl",
    [EstforConstants.SCORCHING_BOOTS]: "Scorching Boots",
    [EstforConstants.SCORCHING_CHAPS]: "Scorching Chaps",

    [EstforConstants.GODLY_BOW]: "Godly Bow",
    [EstforConstants.DRAGONSTONE_STAFF]: "Dragonstone Staff",
    [EstforConstants.LOG]: "Log",
    [EstforConstants.OAK_LOG]: "Oak Log",
    [EstforConstants.MAPLE_LOG]: "Maple Log",
    [EstforConstants.ENCHANTED_LOG]: "Enchanted Log",
    [EstforConstants.ASH_LOG]: "Ash Log",
    [EstforConstants.REDWOOD_LOG]: "Redwood Log",
    [EstforConstants.LIVING_LOG]: "Living Log",
    [EstforConstants.WILLOW_LOG]: "Willow Log",
    [EstforConstants.MAGICAL_LOG]: "Magical Log",

    [EstforConstants.IRON_ORE]: "Iron Ore",
    [EstforConstants.COPPER_ORE]: "Copper Ore",
    [EstforConstants.TIN_ORE]: "Tin Ore",
    [EstforConstants.MITHRIL_ORE]: "Mithril Ore",
    [EstforConstants.ADAMANTINE_ORE]: "Adamantine Ore",
    [EstforConstants.RUNITE_ORE]: "Runite Ore",
    [EstforConstants.TITANIUM_ORE]: "Titanium Ore",
    [EstforConstants.ORICHALCUM_ORE]: "Oricalcum Ore",
    [EstforConstants.RUBY]: "Ruby",
    [EstforConstants.EMERALD]: "Emerald",
    [EstforConstants.SAPPHIRE]: "Sapphire",
    [EstforConstants.DIAMOND]: "Diamond",
    [EstforConstants.AMETHYST]: "Amethyst",
    [EstforConstants.COAL_ORE]: "Coal Ore",

    [EstforConstants.WOOD_FISHING_ROD]: "Wood Fishing Rod",
    [EstforConstants.NET_STICK]: "Net with Stick",
    [EstforConstants.MEDIUM_NET]: "Medium Net",
    [EstforConstants.LARGE_NET]: "Large Net",
    [EstforConstants.CAGE]: "Cage",
    [EstforConstants.HARPOON]: "Harpoon",

    [EstforConstants.RAW_MINNUS]: "Raw Minnus",
    [EstforConstants.RAW_BLEKK]: "Raw Blekk",
    [EstforConstants.RAW_SKRIMP]: "Raw Skrimp",
    [EstforConstants.RAW_FEOLA]: "Raw Feola",
    [EstforConstants.RAW_ANCHO]: "Raw Ancho",
    [EstforConstants.RAW_TROUT]: "Raw Trout",
    [EstforConstants.RAW_ROJJA]: "Raw Rojja",
    [EstforConstants.RAW_BOWFISH]: "Raw Bowfish",
    [EstforConstants.RAW_GOLDFISH]: "Raw Goldfish",
    [EstforConstants.RAW_MYSTY_BLUE]: "Raw Mysty Blue",
    [EstforConstants.RAW_FLITFISH]: "Raw Flitfish",
    [EstforConstants.RAW_RAZORFISH]: "Raw Razorfish",
    [EstforConstants.RAW_QUAFFER]: "Raw Quaffer",
    [EstforConstants.RAW_ROXA]: "Raw Roxa",
    [EstforConstants.RAW_AZACUDDA]: "Raw Azacudda",
    [EstforConstants.RAW_STONECLAW]: "Raw Stoneclaw",
    [EstforConstants.RAW_CRUSKAN]: "Raw Cruskan",
    [EstforConstants.RAW_CHODFISH]: "Raw Chodfish",
    [EstforConstants.RAW_DOUBTFISH]: "Raw Doubtfish",
    [EstforConstants.RAW_ROSEFIN]: "Raw Rosefin",

    [EstforConstants.MAGIC_FIRE_STARTER]: "Magic Fire Starter",
    [EstforConstants.XP_BOOST]: "XP Boost",
    [EstforConstants.SKILL_BOOST]: "Skill Boost",
    [EstforConstants.COMBAT_BOOST]: "Combat Boost",
    [EstforConstants.GATHERING_BOOST]: "Gathering Boost",
}

export interface EquippedItems {
    head: number | undefined
    neck: number | undefined
    body: number | undefined
    arms: number | undefined
    legs: number | undefined
    feet: number | undefined
    rightHand: number | undefined
    leftHand: number | undefined
    magicBag: number | undefined
    quiver: number | undefined
    food: number | undefined
    playerId: number | undefined
}

export interface ItemState {
    items: ItemInput[]
    rangedActionChoices: ActionChoiceInput[]
    magicActionChoices: ActionChoiceInput[]
    equippedItems: EquippedItems[]
    itemSearch: string
}

export const useItemStore = defineStore({
    id: "items",
    state: () =>
        ({
            items: allItems as ItemInput[],
            rangedActionChoices: allActionChoicesRanged as ActionChoiceInput[],
            magicActionChoices: allActionChoicesMagic as ActionChoiceInput[],
            equippedItems: localStorage.getItem("equippedItemsMulti")
                ? JSON.parse(
                      localStorage.getItem("equippedItemsMulti") as string
                  )
                : ([] as EquippedItems[]),
            itemSearch: "",
        }) as ItemState,
    getters: {
        getCurrentEquippedItems(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            return state.equippedItems.find(
                (x) => x.playerId === Number(playerState.id)
            )
        },
        getItemsForSlotAndXP: (state: ItemState) => {
            return (position: EquipPosition) => {
                const coreStore = useCoreStore()
                const playerState = coreStore.playerState

                return state.items.filter(
                    (x) =>
                        x.equipPosition === position &&
                        ((x.skill == Skill.DEFENCE &&
                            x.minXP <= playerState.defenceXP) ||
                            (x.skill == Skill.MELEE &&
                                x.minXP <= playerState.meleeXP) ||
                            (x.skill == Skill.RANGED &&
                                x.minXP <= playerState.rangedXP) ||
                            (x.skill == Skill.MAGIC &&
                                x.minXP <= playerState.magicXP) ||
                            (x.skill == Skill.NONE &&
                                (playerState.isFullMode
                                    ? true
                                    : !x.isFullModeOnly)))
                )
            }
        },
        getMagicActionChoicesForXP(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            return state.magicActionChoices
                .filter((x) => x.minXPs.every((y) => y <= playerState.magicXP))
                .map((x, i) => ({
                    ...x,
                    tokenId: x.skillDiff,
                    name: magicSpellNames[i]
                        .split(" ")
                        .map(
                            (w) =>
                                w[0].toUpperCase() +
                                w.substring(1).toLowerCase()
                        )
                        .join(" "),
                }))
        },
        getAggregatedCombatStats(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            const stats = new CombatStats()
            const localEquippedItems =
                (state.equippedItems.find(
                    (x) => x.playerId === Number(playerState.id)
                ) as any) || {}
            Object.keys(localEquippedItems).forEach((key) => {
                if (key !== "magicBag" && key !== "playerId") {
                    // skip magic bag as they require special calculations
                    const item = state.items.find(
                        (x) => x.tokenId === localEquippedItems[key]
                    )
                    if (item) {
                        stats.melee += item.combatStats.melee
                        stats.magic += item.combatStats.magic
                        stats.ranged += item.combatStats.ranged
                        stats.meleeDefence += item.combatStats.meleeDefence
                        stats.magicDefence += item.combatStats.magicDefence
                        stats.rangedDefence += item.combatStats.rangedDefence
                        stats.health += item.combatStats.health
                    }
                }
            })

            if (localEquippedItems.magicBag) {
                stats.magic += localEquippedItems.magicBag
            }

            return stats
        },
        getTotalCombatStats(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            const stats = new CombatStats()
            const localEquippedItems =
                (state.equippedItems.find(
                    (x) => x.playerId === Number(playerState.id)
                ) as any) || {}
            Object.keys(localEquippedItems).forEach((key) => {
                if (key !== "magicBag" && key !== "playerId") {
                    // skip magic bag as they require special calculations
                    const item = state.items.find(
                        (x) => x.tokenId === localEquippedItems[key]
                    )
                    if (item) {
                        stats.melee += item.combatStats.melee
                        stats.magic += item.combatStats.magic
                        stats.ranged += item.combatStats.ranged
                        stats.meleeDefence += item.combatStats.meleeDefence
                        stats.magicDefence += item.combatStats.magicDefence
                        stats.rangedDefence += item.combatStats.rangedDefence
                        stats.health += item.combatStats.health
                    }
                }
            })

            if (localEquippedItems.magicBag) {
                stats.magic += localEquippedItems.magicBag
            }

            stats.melee += getLevel(playerState.meleeXP)
            stats.magic += getLevel(playerState.magicXP)
            stats.ranged += getLevel(playerState.rangedXP)
            stats.meleeDefence += getLevel(playerState.defenceXP)
            stats.magicDefence += getLevel(playerState.defenceXP)
            stats.rangedDefence += getLevel(playerState.defenceXP)
            stats.health += getLevel(playerState.healthXP)

            return stats
        },
    },
    actions: {
        updateEquippedItems(equippedItems: EquippedItems) {
            const coreStore = useCoreStore()
            const e = this.equippedItems.find(
                (x) => x.playerId === Number(coreStore.playerId)
            )
            if (e) {
                e.head = equippedItems.head
                e.neck = equippedItems.neck
                e.body = equippedItems.body
                e.arms = equippedItems.arms
                e.legs = equippedItems.legs
                e.feet = equippedItems.feet
                e.rightHand = equippedItems.rightHand
                e.leftHand = equippedItems.leftHand
                e.magicBag = equippedItems.magicBag
                e.quiver = equippedItems.quiver
                e.food = equippedItems.food
            } else {
                equippedItems.playerId = Number(coreStore.playerId)
                this.equippedItems.push(equippedItems)
            }
            localStorage.setItem(
                "equippedItemsMulti",
                JSON.stringify(this.equippedItems)
            )
        },
    },
})
