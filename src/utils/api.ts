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

export interface PlayerResult {
    player: Player
}

export const getPlayerState = async (
    playerId: number
): Promise<PlayerResult> => {
    const response = await fetch(
        `${baseUrl}/players/${playerId}`
    )
    return response.json()
}