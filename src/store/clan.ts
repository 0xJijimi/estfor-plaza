import { Clan, Player } from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"
import { getClans } from "../utils/api"
import { getLevel } from "./core"

export interface ClanState {
    clans: Clan[]
    initialised: boolean
}

export const getDiceRollForRank = (rank: number, isEvolved: boolean) => {
    // get 1 dice roll every 20 ranks, start with 1 by default
    return Math.floor(rank / 20) + 1 + (isEvolved ? 1 : 0)
}

export const getDiceRolls = (player: Player) => {
    let diceRolls = 0
    diceRolls += getDiceRollForRank(getLevel(player.woodcuttingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.miningXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.fishingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.cookingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.smithingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.fletchingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.craftingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.healthXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.meleeXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.defenceXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.rangedXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.magicXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.alchemyXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.firemakingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.thievingXP), player.isFullMode)
    diceRolls += getDiceRollForRank(getLevel(player.forgingXP), player.isFullMode)
    return diceRolls
}

export const useClanStore = defineStore({
    id: 'clan',
    state: () => 
        ({
            clans: [] as Clan[],
            initialised: false,
        } as ClanState),
    getters: {
        clanNames(state: ClanState) {
            return state.clans.map((clan) => clan.name)
        },
    },
    actions: {
        async getAllClans() {
            let numToSkip = 0
            let moreToFetch = true
            let localClans: Clan[] = []
            while (moreToFetch) {
                const clans = await getClans(numToSkip)
                if (clans.clans.length === 0) {
                    moreToFetch = false
                } else {
                    localClans.push(...clans.clans)
                    numToSkip += clans.clans.length
                }
            }
            this.clans = localClans
            this.initialised = true
        },
    },
})