import { Clan } from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"
import { getClans } from "../utils/api"

export interface ClanState {
    clans: Clan[]
    initialised: boolean
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