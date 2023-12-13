import { BoostType, UserItemNFT } from "@paintswap/estfor-definitions/types"

const baseUrl = 'https://api.estfor.com'

export interface Player {
    id: number
    tokenId: number
    avatarId: number
    name: string
    owner: string
    isActive: boolean
    meleeXP: number
    defenceXP: number
    magicXP: number
    rangedXP: number
    healthXP: number
    miningXP: number
    smithingXP: number
    woodcuttingXP: number
    firemakingXP: number
    cookingXP: number
    craftingXP: number
    fishingXP: number
    thievingXP: number
    agilityXP: number
    fletchingXP: number
    alchemyXP: number
    forgingXP: number
    isFullMode: boolean
}

export interface Clan {
    id: number
    name: string
    boostStartTime: string
    boostDuration: number
    boostVal: number
    boostType: BoostType
    boostItemTokenId: number
}

export interface ClanMember {
    player: Player
    clan: Clan | null
}

export interface ClanMemberResult {
    clanMember: ClanMember
}

export interface PlayerResult {
    player: Player
}

export interface CoreData {
    gamePaused: boolean
    globalBoostStartTime: string
    globalBoostDuration: number
    globalBoostVal: number
    globalBoostType: BoostType
    globalBoostItemTokenId: number
}

export interface CoreDataResult {
    coreData: CoreData
}

export interface UserItemNFTResult {
    userItemNFTs: UserItemNFT[]
}

export interface PlayerSearchResult {
    players: Player[]
}

export const getPlayerState = async (
    playerId: number
): Promise<ClanMemberResult> => {
    const response = await fetch(
        `${baseUrl}/clan-members/${playerId}`
    )
    return response.json()
}

export const getGlobalData = async (): Promise<CoreDataResult> => {
    const response = await fetch(
        `${baseUrl}/core-data`
    )
    return response.json()
}

export const getUserItemNFTs = async (user: string, tokenIds: number[]): Promise<UserItemNFTResult> => {
    const response = await fetch(
        `${baseUrl}/user-item-nfts/${user}?${tokenIds.map(x => `tokenIds[]=${x}`).join('&')}`
    )
    return response.json()
}

export const getPlayers = async (searchTerm: string): Promise<PlayerSearchResult> => {
    const response = await fetch(
        `${baseUrl}/players?name=${searchTerm}`
    )
    return response.json()
}

export const getSoloPlayerState =async (playerId: number): Promise<PlayerResult> => {
    const response = await fetch(
        `${baseUrl}/players/${playerId}`
    )
    return response.json()
}