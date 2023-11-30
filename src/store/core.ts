import { defineStore } from "pinia"
import { account, readContract, } from '@kolirt/vue-web3-auth'

import estforPlayerAbi from '../abi/estforPlayer.json'
import { CoreData, Clan, Player, getPlayerState, getGlobalData } from "../utils/api"
import { BoostType } from "@paintswap/estfor-definitions/types"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { allItems } from "../data/items"

export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const MEDIA_URL = 'https://media.estfor.com'

export enum Network {
    fantom = "fantom",
}

export enum Address {
    estforPlayers,
}

export interface AddressMap {
    name: Address
    address: string
}

export interface AddressNetworkMap {
    network: Network
    addresses: AddressMap[]
}

export interface CoreState {
    addresses: AddressNetworkMap[]
    connectedNetwork: Network
    playerId: number
    playerState: Player
    clanState: Clan | null
    coreData: CoreData
    applyBoost: boolean
    individualBoost: number | null
    applyWishingWellBoost: boolean
}

export const boostVialNames = {
    [EstforConstants.COMBAT_BOOST]: "Combat Boost",
    [EstforConstants.XP_BOOST]: "XP Boost",
    [EstforConstants.SKILL_BOOST]: "Skill Boost",
    [EstforConstants.GATHERING_BOOST]: "Gathering Boost",
}

export const boostTypeNames = {
    [BoostType.ANY_XP]: "All XP",
    [BoostType.COMBAT_XP]: "Combat XP",
    [BoostType.NON_COMBAT_XP]: "Non-Combat XP",
    [BoostType.GATHERING]: "Gathering Bonus",
    [BoostType.ABSENCE]: "Absence Bonus",
    [BoostType.NONE]: "None",
    [BoostType.PASSIVE_SKIP_CHANCE]: "Passive Skip Chance",
}

export const xpBoundaries = [0, 84, 174, 270, 374, 486, 606, 734, 872, 1021, 1179, 1350, 1532, 1728, 1938, 2163, 2404, 2662, 2939, 3236, 3553, 3894, 4258, 4649, 5067, 5515, 5995, 6510, 7060, 7650, 8282, 8959, 9685, 10461, 11294, 12185, 13140, 14162, 15258, 16432, 17689, 19036, 20479, 22025, 23681, 25456, 27357, 29393, 31575, 33913, 36418, 39102, 41977, 45058, 48359, 51896, 55686, 59747, 64098, 68761, 73757, 79110, 84847, 90995, 97582, 104641, 112206, 120312, 128998, 138307, 148283, 158973, 170430, 182707, 195864, 209963, 225074, 241267, 258621, 277219, 297150, 318511, 341403, 365936, 392228, 420406, 450605, 482969, 517654, 554828, 594667, 637364, 683124, 732166, 784726, 841057, 901428, 966131, 1035476, 1109796] 

export const getLevel = (xp: number) => {
    return xpBoundaries.findIndex(x => x > xp)
}

export const useCoreStore = defineStore({
    id: "core",
    state: () =>
        ({
            addresses: [                
                {
                    network: Network.fantom,
                    addresses: [
                        {
                            name: Address.estforPlayers,
                            address: '0x058eC56ABa13F7FEE3ae9c9b91B3bB03bc336143',
                        },
                    ],
                },
            ],
            connectedNetwork: Network.fantom,
            playerId: 0,
            playerState: {} as Player,
            clanState: null,
            coreData: {} as CoreData,
            applyBoost: true,
            individualBoost: null,
            applyWishingWellBoost: false,
        } as CoreState),
    getters: {
        getNetworkAddressMap: (state: CoreState): AddressMap[] | undefined => {
            return state.addresses.find(x => x.network == state.connectedNetwork)?.addresses
        },
        getAddress: (state: CoreState) => {
            return (name: Address) => state.addresses.find(x => x.network == state.connectedNetwork)?.addresses.find(x => x.name == name)?.address; 
        },
        globalBoostData: (state: CoreState) => {
            const globalBoost = {
                value: state.coreData.globalBoostVal,
                isNonCombatActive: false,
                isCombatActive: false,
                startDateTime: new Date(parseInt(state.coreData.globalBoostStartTime, 10) * 1000),
                endDateTime: new Date(parseInt(state.coreData.globalBoostStartTime, 10) * 1000 + state.coreData.globalBoostDuration * 1000),
            }
        
            if (state.coreData.globalBoostType === BoostType.NON_COMBAT_XP || state.coreData.globalBoostType === BoostType.ANY_XP) {
                if (globalBoost.endDateTime.getTime() > Date.now()) {
                    globalBoost.isNonCombatActive = true
                }
            } 
            if (state.coreData.globalBoostType === BoostType.COMBAT_XP || state.coreData.globalBoostType === BoostType.ANY_XP) {
                if (globalBoost.endDateTime.getTime() > Date.now()) {
                    globalBoost.isCombatActive = true
                }
            }
            return globalBoost
        },
        clanBoostData: (state: CoreState) => {
            if (!state.clanState) {
                return {
                    value: 0,
                    isNonCombatActive: false,
                    isCombatActive: false,
                    startDateTime: new Date(),
                    endDateTime: new Date(),
                }
            }
            
            const clanBoost = {
                value: state.clanState.boostVal,
                isNonCombatActive: false,
                isCombatActive: false,
                startDateTime: new Date(parseInt(state.clanState.boostStartTime, 10) * 1000),
                endDateTime: new Date(parseInt(state.clanState.boostStartTime, 10) * 1000 + state.clanState.boostDuration * 1000),
            }
        
            if (state.clanState.boostType === BoostType.NON_COMBAT_XP || state.clanState.boostType === BoostType.ANY_XP) {
                if (clanBoost.endDateTime.getTime() > Date.now()) {
                    clanBoost.isNonCombatActive = true
                }
            } 
            if (state.clanState.boostType === BoostType.COMBAT_XP || state.clanState.boostType === BoostType.ANY_XP) {
                if (clanBoost.endDateTime.getTime() > Date.now()) {
                    clanBoost.isCombatActive = true
                }
            }
            return clanBoost
        },
        getNonCombatXPBoostMultiplier: (state: CoreState) => {
            if (!state.applyBoost) {
                return 1
            }

            let multiplier = 1
            if (state.coreData.globalBoostType === BoostType.NON_COMBAT_XP || state.coreData.globalBoostType === BoostType.ANY_XP) {
                if (new Date((parseInt(state.coreData.globalBoostStartTime, 10) * 1000) + (state.coreData.globalBoostDuration * 1000)) > new Date()) {
                    multiplier += state.coreData.globalBoostVal / 100
                }
            }
            if (state.clanState && (state.clanState.boostType === BoostType.NON_COMBAT_XP || state.clanState.boostType === BoostType.ANY_XP)) {
                if (new Date((parseInt(state.clanState.boostStartTime, 10) * 1000) + (state.clanState.boostDuration * 1000)) > new Date()) {
                    multiplier += state.clanState.boostVal / 100
                }
            }

            if (state.individualBoost) {
                const vial = allItems.find(x => x.tokenId === state.individualBoost)
                if (vial?.boostType === BoostType.NON_COMBAT_XP || vial?.boostType === BoostType.ANY_XP) {
                    multiplier += vial.boostValue / 100
                }
            }

            if (state.applyWishingWellBoost) {
                const vial = allItems.find(x => x.tokenId === EstforConstants.LUCK_OF_THE_DRAW)
                if (vial?.boostType === BoostType.NON_COMBAT_XP || vial?.boostType === BoostType.ANY_XP) {
                    multiplier += vial.boostValue / 100
                }
            }

            return multiplier
        },
    },
    actions: {
        setCurrentNetwork(network: Network) {         
            this.connectedNetwork = network
            this.disconnect()
        },
        disconnect() {
            // reset state  
            this.playerId = 0
            this.playerState = {} as Player
            this.clanState = null
        },
        async getActivePlayer() {
            const playerAddress = this.getAddress(Address.estforPlayers)
            if (!playerAddress || !account.connected) {
                return
            }

            const activePlayer = await readContract({
                address: playerAddress as `0x${string}`,
                abi: estforPlayerAbi,
                functionName: 'activePlayer',
                args: [account.address],
            })

            this.playerId = activePlayer as unknown as number

            const playerState = await getPlayerState(this.playerId)
            this.playerState = playerState.clanMember.player

            if (playerState.clanMember.clan) {
                this.clanState = playerState.clanMember.clan
            }

            const globalState = await getGlobalData()
            this.coreData = globalState.coreData
        },
    },
})
