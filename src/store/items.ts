import { ActionChoiceInput, CombatStats, EquipPosition, ItemInput, Skill } from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allItems } from '../data/items'
import { allActionChoicesRanged, allActionChoicesMagic } from "../data/actionChoices"
import { getLevel, useCoreStore } from "./core"

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

export interface EquippedItems {
    head: number | undefined,
    neck: number | undefined,
    body: number | undefined,
    arms: number | undefined,
    legs: number | undefined,
    feet: number | undefined,
    rightHand: number | undefined,
    leftHand: number | undefined,
    magicBag: number | undefined,
    quiver: number | undefined,
    food: number | undefined,
}

export interface ItemState {
    items: ItemInput[],
    rangedActionChoices: ActionChoiceInput[],
    magicActionChoices: ActionChoiceInput[],
    equippedItems: EquippedItems,
}

export const useItemStore = defineStore({
    id: "items",
    state: () =>
        ({
            items: allItems as ItemInput[],
            rangedActionChoices: allActionChoicesRanged as ActionChoiceInput[],
            magicActionChoices: allActionChoicesMagic as ActionChoiceInput[],
            equippedItems: localStorage.getItem('equippedItems') ? JSON.parse(localStorage.getItem('equippedItems') as string) : {} as EquippedItems,
        } as ItemState),
    getters: {
        getItemsForSlotAndXP: (state: ItemState) => {
            return (position: EquipPosition) => {
                const coreStore = useCoreStore()
                const playerState = coreStore.playerState
                
                return state.items.filter(x => x.equipPosition === position && (
                    (x.skill == Skill.DEFENCE && x.minXP <= playerState.defenceXP) ||
                    (x.skill == Skill.MELEE && x.minXP <= playerState.meleeXP) ||
                    (x.skill == Skill.RANGED && x.minXP <= playerState.rangedXP) ||
                    (x.skill == Skill.MAGIC && x.minXP <= playerState.magicXP) ||
                    (x.skill == Skill.NONE) &&
                    (playerState.isFullMode ? true : !x.isFullModeOnly)
                ))
            }
        },
        getMagicActionChoicesForXP(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            return state.magicActionChoices.filter(x => x.minXPs.every(y => y <= playerState.magicXP)).map((x, i) => ({
                ...x,
                tokenId: x.skillDiff,
                name: magicSpellNames[i].split(' ')
                    .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
                    .join(' '),
            }))
        },
        getAggregatedCombatStats(state: ItemState) {
            const stats = new CombatStats()
            const localEquippedItems = state.equippedItems as any
            Object.keys(state.equippedItems).forEach((key) => {
                if (key !== 'magicBag') { // skip magic bag as they require special calculations
                    const item = state.items.find(x => x.tokenId === localEquippedItems[key])
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
        
            if (state.equippedItems.magicBag) {
                stats.magic += state.equippedItems.magicBag
            }
            
            return stats
        },
        getTotalCombatStats(state: ItemState) {
            const coreStore = useCoreStore()            
            const playerState = coreStore.playerState

            const stats = new CombatStats()
            const localEquippedItems = state.equippedItems as any
            Object.keys(state.equippedItems).forEach((key) => {
                if (key !== 'magicBag') { // skip magic bag as they require special calculations
                    const item = state.items.find(x => x.tokenId === localEquippedItems[key])
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
        
            if (state.equippedItems.magicBag) {
                stats.magic += state.equippedItems.magicBag
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
            this.equippedItems = equippedItems
            localStorage.setItem('equippedItems', JSON.stringify(equippedItems))
        },
    },
})