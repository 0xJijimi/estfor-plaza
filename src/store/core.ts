import { defineStore } from "pinia"
import { account, readContract, } from '@kolirt/vue-web3-auth'

import estforPlayerAbi from '../abi/estforPlayer.json'
import broochAbi from '../abi/brooch.json'
import { CoreData, Clan, Player, getPlayerState, getGlobalData, getUserItemNFTs, getSoloPlayerState } from "../utils/api"
import { BoostType, Skill, UserItemNFT } from "@paintswap/estfor-definitions/types"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { allItems } from "../data/items"
import { allFullAttireBonuses } from "../data/fullAttireBonuses"
import { HOMEMADE_BROOCH_ADDRESS } from "../utils/addresses"

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
    inventory: UserItemNFT[]
    heroRoster: Player[]
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

export const avatarBoostSkills = {
    [1]: [Skill.MAGIC],
    [2]: [Skill.THIEVING],
    [3]: [Skill.MAGIC, Skill.DEFENCE],
    [4]: [Skill.MELEE],
    [5]: [Skill.MAGIC, Skill.HEALTH],
    [6]: [Skill.MELEE, Skill.DEFENCE],
    [7]: [Skill.RANGED],
    [8]: [Skill.MELEE, Skill.MAGIC],
    [10001]: [Skill.MAGIC],
    [10002]: [Skill.THIEVING],
    [10003]: [Skill.MAGIC, Skill.DEFENCE],
    [10004]: [Skill.MELEE],
    [10005]: [Skill.MAGIC, Skill.HEALTH],
    [10006]: [Skill.MELEE, Skill.DEFENCE],
    [10007]: [Skill.RANGED],
    [10008]: [Skill.MELEE, Skill.MAGIC],
}

export const skillToXPMap = {
    [Skill.FISHING]: 'fishingXP',
    [Skill.WOODCUTTING]: 'woodcuttingXP',
    [Skill.MINING]: 'miningXP',
    [Skill.FLETCHING]: 'fletchingXP',
    [Skill.FIREMAKING]: 'firemakingXP',
    [Skill.COOKING]: 'cookingXP',
    [Skill.SMITHING]: 'smithingXP',
    [Skill.CRAFTING]: 'craftingXP',
    [Skill.ALCHEMY]: 'alchemyXP',
    [Skill.FORGING]: 'forgingXP',
    [Skill.THIEVING]: 'thievingXP',
}

export const xpBoundaries = [0, 84, 174, 270, 374, 486, 606, 734, 872, 1021, 1179, 1350, 1532, 1728, 1938, 2163, 2404, 2662, 2939, 3236, 3553, 3894, 4258, 4649, 5067, 5515, 5995, 6510, 7060, 7650, 8282, 8959, 9685, 10461, 11294, 12185, 13140, 14162, 15258, 16432, 17689, 19036, 20479, 22025, 23681, 25456, 27357, 29393, 31575, 33913, 36418, 39102, 41977, 45058, 48359, 51896, 55686, 59747, 64098, 68761, 73757, 79110, 84847, 90995, 97582, 104641, 112206, 120312, 128998, 138307, 148283, 158973, 170430, 182707, 195864, 209963, 225074, 241267, 258621, 277219, 297150, 318511, 341403, 365936, 392228, 420406, 450605, 482969, 517654, 554828, 594667, 637364, 683124, 732166, 784726, 841057, 901428, 966131, 1035476, 1109796] 

export const getLevel = (xp: number) => {
    const level = xpBoundaries.findIndex(x => x > xp)
    return level === -1 ? 100 : level
}

export const heroAvatarMultiplier = (player: Player, skill: Skill) => {
    let multiplier = 0
    // @ts-ignore
    if ((avatarBoostSkills[player.avatarId] || []).includes(skill)) {
        let heroXPMultiplier = 1
        if (player.isFullMode) {
            heroXPMultiplier = 2
        }
        // @ts-ignore
        if (avatarBoostSkills[player.avatarId]?.length === 2) {
            multiplier += 0.05 * heroXPMultiplier
        } else {
            multiplier += 0.1 * heroXPMultiplier
        }
    }
    return multiplier
}

export const fullAttireMultiplier = (inventory: UserItemNFT[], skill: Skill) => {
    const fullAttireBonus = allFullAttireBonuses.find(x => x.skill === skill)
    if (!fullAttireBonus) {
        return 0
    }

    const fullAttire = fullAttireBonus.itemTokenIds.every(x => inventory.some(y => y.tokenId === x && parseInt(y.amount, 10) > 0))
    if (!fullAttire) {
        return 0
    }

    return fullAttireBonus.bonusXPPercent / 100
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
            inventory: [],
            heroRoster: localStorage.getItem('heroRoster') ? JSON.parse(localStorage.getItem('heroRoster') as string) : [],
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
        getXPBoostMultiplier: (state: CoreState) => {
            return (skill: Skill, boost: BoostType) => {
                let multiplier = 1
                
                // Apply innate hero boosts as they always count
                multiplier += heroAvatarMultiplier(state.playerState, skill)

                // Apply set bonus from full attire if applicable
                multiplier += fullAttireMultiplier(state.inventory, skill)

                if (!state.applyBoost) {
                    return multiplier
                }

                if (state.coreData.globalBoostType === boost || state.coreData.globalBoostType === BoostType.ANY_XP) {
                    if (new Date((parseInt(state.coreData.globalBoostStartTime, 10) * 1000) + (state.coreData.globalBoostDuration * 1000)) > new Date()) {
                        multiplier += state.coreData.globalBoostVal / 100
                    }
                }
                if (state.clanState && (state.clanState.boostType === boost || state.clanState.boostType === BoostType.ANY_XP)) {
                    if (new Date((parseInt(state.clanState.boostStartTime, 10) * 1000) + (state.clanState.boostDuration * 1000)) > new Date()) {
                        multiplier += state.clanState.boostVal / 100
                    }
                }

                // Average the boost values over the duration if they're shorter than a day
                if (state.individualBoost) {
                    const vial = allItems.find(x => x.tokenId === state.individualBoost)
                    if (vial?.boostType === boost || vial?.boostType === BoostType.ANY_XP) {
                        multiplier += (vial.boostValue / 100) * (vial.boostDuration >= (60 * 60 * 24) ? 1 : vial.boostDuration / (60 * 60 * 24))
                    }
                }

                if (state.applyWishingWellBoost) {
                    const vial = allItems.find(x => x.tokenId === EstforConstants.LUCK_OF_THE_DRAW)
                    if (vial?.boostType === boost || vial?.boostType === BoostType.ANY_XP) {
                        multiplier += (vial.boostValue / 100) * (vial.boostDuration >= (60 * 60 * 24) ? 1 : vial.boostDuration / (60 * 60 * 24))
                    }
                }

                return multiplier
            }
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
            this.inventory = []
        },
        async getAllPlayerInfo(playerId: number) {
            this.playerId = playerId

            const playerState = await getPlayerState(this.playerId)
            if (playerState.clanMember) {
                this.playerState = playerState.clanMember.player

                if (playerState.clanMember.clan) {
                    this.clanState = playerState.clanMember.clan
                }
            } else {
                this.clanState = null
                const soloPlayerState = await getSoloPlayerState(this.playerId)
                this.playerState = soloPlayerState.player
            }

            const inventory = await getUserItemNFTs(this.playerState.owner, allFullAttireBonuses.flatMap(x => x.itemTokenIds))
            this.inventory = inventory.userItemNFTs

            this.addHeroToRoster(this.playerState)
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

            await this.getAllPlayerInfo(activePlayer as unknown as number)

            const globalState = await getGlobalData()
            this.coreData = globalState.coreData
        },
        async loadPlayer(playerId: number) {
            const balance = await readContract({
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: 'balanceOf',
                args: [account.address, 0],
            })

            if ((balance as unknown as bigint) < 1) {
                throw new Error('NO_EMERALD_BROOCH')
            }

            await this.getAllPlayerInfo(playerId)
        },
        addHeroToRoster(player: Player) {
            if (!this.heroRoster.some(x => x.id === player.id)) {
                this.heroRoster.push(player)
                localStorage.setItem('heroRoster', JSON.stringify(this.heroRoster))
            }
        },
        removeHeroFromRoster(player: Player) {
            this.heroRoster = this.heroRoster.filter(x => x.id !== player.id)
            localStorage.setItem('heroRoster', JSON.stringify(this.heroRoster))
        },
    },
})
