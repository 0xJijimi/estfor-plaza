import {
    Clan,
    CoreData,
    Donation,
    Lottery,
    Pet,
    Player,
    QueuedAction,
    RaffleEntry,
    Territory,
    UserItemNFT,
    PlayerQuest,
} from "@paintswap/estfor-definitions/types"
import { sleep } from "./time"

const getBaseUrl = () => {
    return "https://api.estfor.com"
}

const CHUNK_SIZE = 500

export interface ClanMember {
    id: string
    player: Player
    clan: Clan | null
    joinedTimestamp: string
    totalDonated: string
}

export interface ClanMemberResult {
    clanMember: ClanMember
}

export interface ClanMembersResult {
    clanMembers: ClanMember[]
}

export interface ClansResult {
    clans: Clan[]
}

export interface PetsResult {
    pets: Pet[]
}

export interface PlayerResult {
    player: Player
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

export interface LotteriesResult {
    lotteries: Lottery[]
}

export interface RaffleEntryResult {
    raffleEntries: RaffleEntry[]
}

export interface SearchQueuedActionsResult {
    queuedActions: QueuedAction[]
}

export interface TerritoriesResult {
    territories: Territory[]
}

export interface DonationsResult {
    donations: Donation[]
}

export interface Avatar {
    id: string
}

export interface AvatarSearchResult {
    avatars: Avatar[]
}

export interface PlayerQuestsResult {
    playerQuests: PlayerQuest[]
}

const fetchRetry = async (url: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    let retries = 0
    while (retries < 50) {
        try {
            const response = await fetch(url, {
                method,
                body,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (response.status === 200) {
                return response.json()
            }
            await sleep(1000)
        } catch (e) {
            await sleep(1000)
        }
    }
    return null
}

export const getPlayerState = async (
    playerId: string,
): Promise<ClanMemberResult> => {
    return fetchRetry(`${getBaseUrl()}/clan-members/${playerId}`)
}

export const getGlobalData = async (): Promise<CoreDataResult> => {
    return fetchRetry(`${getBaseUrl()}/core-data`)
}

export const getUserItemNFTs = async (
    user: string,
    tokenIds: number[],
): Promise<UserItemNFTResult> => {
    return fetchRetry(
        `${getBaseUrl()}/user-item-nfts/${user}?${tokenIds
            .map((x) => `tokenIds[]=${x}`)
            .join("&")}`
    )
}

export const getMultiUserItemNFTs = async (
    users: string[],
    tokenIds: number[],
): Promise<UserItemNFTResult> => {
    let result: UserItemNFTResult = {
        userItemNFTs: []
    }

    for (let i = 0; i < users.length; i += CHUNK_SIZE) {
        const chunk = users.slice(i, i + CHUNK_SIZE)
        let localResult: UserItemNFTResult | null = null        
        let numToSkip = 0
        while (!localResult || localResult?.userItemNFTs.length === 1000) {
            localResult = await fetchRetry(
                `${getBaseUrl()}/user-item-nfts/multi?numToSkip=${numToSkip}&numToFetch=1000${tokenIds.length > 0 ? `&${tokenIds
                    .map((x) => `tokenIds[]=${x}`)
                    .join("&")}` : ""}`,
                'POST',
                JSON.stringify({
                    userAddresses: chunk
                })
            )
            numToSkip += 1000

            if (localResult) {
                result.userItemNFTs = [...result.userItemNFTs, ...localResult.userItemNFTs]
            }
        }
    }
    return result
}

export const getPlayers = async (
    searchTerm: string,
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${getBaseUrl()}/players?name=${searchTerm}`)
}

export const getMultiPlayersByOwner = async (
    addresses: string[],
): Promise<PlayerSearchResult> => {    
    let result: PlayerSearchResult = {
        players: []
    }

    for (let i = 0; i < addresses.length; i += CHUNK_SIZE) {
        let localResult: PlayerSearchResult | null = null
        const chunk = addresses.slice(i, i + CHUNK_SIZE)        
        localResult = await fetchRetry(`${getBaseUrl()}/players/multi?numToSkip=0&numToFetch=1000`, 'POST', JSON.stringify({
            owners: chunk,
        }))

        if (localResult) {
            result.players = [...result.players, ...localResult.players]
        }
    }
    return result
}

export const getPlayersByOwner = async (
    address: string,
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${getBaseUrl()}/players?owner=${address}`)
}

export const getExactPlayers = async (
    searchTerm: string,
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${getBaseUrl()}/players?exactName=${searchTerm}`)
}

export const getPlayersByIds = async (
    ids: string[],
    numToSkip: number = 0,
): Promise<PlayerSearchResult> => {
    return fetchRetry(
        `${getBaseUrl()}/players?numToSkip=${numToSkip}&${ids
            .map((x) => `tokenIds[]=${x}`)
            .join("&")}`
    )
}

export const getSoloPlayerState = async (
    playerId: string,
): Promise<PlayerResult> => {
    return fetchRetry(`${getBaseUrl()}/players/${playerId}`)
}

export const getLotteries = async (
    numToSkip: number,
): Promise<LotteriesResult> => {
    return fetchRetry(`${getBaseUrl()}/lotteries?numToSkip=${numToSkip}`)
}

export const getRaffleEntries = async (
    numToSkip: number,
): Promise<RaffleEntryResult> => {
    return fetchRetry(
        `${getBaseUrl()}/raffle-entries?numToSkip=${numToSkip}`
    )
}

export const getClanMembers = async (
    clanId: string,
): Promise<ClanMembersResult> => {
    return fetchRetry(`${getBaseUrl()}/clan-members?clanId=${clanId}`)
}

export const getClans = async (
    numToSkip: number,
): Promise<ClansResult> => {
    return fetchRetry(
        `${getBaseUrl()}/clans?numToSkip=${numToSkip}&onlyHasVaults=true`
    )
}

export const getClanByName = async (
    name: string,
): Promise<ClansResult> => {
    return fetchRetry(`${getBaseUrl()}/clans?name=${name}`)
}

export const searchQueuedActions = async (
    playerIds: string[],
): Promise<SearchQueuedActionsResult> => {
    let result: SearchQueuedActionsResult = {
        queuedActions: []
    }

    for (let i = 0; i < playerIds.length; i += CHUNK_SIZE) {
        let localResult: SearchQueuedActionsResult | null = null
        const chunk = playerIds.slice(i, i + CHUNK_SIZE)
        localResult = await fetchRetry(
            `${getBaseUrl()}/queued-actions/multi?isActive=true&orderDirection=asc&numToSkip=0&numToFetch=1000`,
            'POST',
            JSON.stringify({
                playerIds: chunk
            })
        )

        if (localResult) {
            result.queuedActions = [...result.queuedActions, ...localResult.queuedActions]
        }
    }
    return result
}

export const getTerritories = async (): Promise<TerritoriesResult> => {
    return fetchRetry(`${getBaseUrl()}/territories`)
}

export const getDonations = async (
    numToSkip: number,
): Promise<DonationsResult> => {
    return fetchRetry(
        `${getBaseUrl()}/donations?numToSkip=${numToSkip}&orderDirection=desc&orderBy=lastUpdatedTimestamp&useUsers=false`
    )
}

export const getAvatars = async (): Promise<AvatarSearchResult> => {
    return fetchRetry(`${getBaseUrl()}/avatars`)
}

export const getOwnedPets = async (
    address: string,
): Promise<PetsResult> => {
    return fetchRetry(`${getBaseUrl()}/pets?owner=${address}`)
}

export const getPlayerQuests = async (
    playerId: string,
): Promise<PlayerQuestsResult> => {
    return fetchRetry(`${getBaseUrl()}/player-quests?playerId=${playerId}`)
}