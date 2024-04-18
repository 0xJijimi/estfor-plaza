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
} from "@paintswap/estfor-definitions/types"
import { sleep } from "./time"

const baseUrl = "https://api.estfor.com"

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

const fetchRetry = async (url: string) => {
    let retries = 0
    while (retries < 50) {
        try {
            const response = await fetch(url)
            return response.json()
        } catch (e) {
            await sleep(1000)
        }
    }
    return null
}

export const getPlayerState = async (
    playerId: string
): Promise<ClanMemberResult> => {
    return fetchRetry(`${baseUrl}/clan-members/${playerId}`)
}

export const getGlobalData = async (): Promise<CoreDataResult> => {
    return fetchRetry(`${baseUrl}/core-data`)
}

export const getUserItemNFTs = async (
    user: string,
    tokenIds: number[]
): Promise<UserItemNFTResult> => {
    return fetchRetry(
        `${baseUrl}/user-item-nfts/${user}?${tokenIds
            .map((x) => `tokenIds[]=${x}`)
            .join("&")}`
    )
}

export const getPlayers = async (
    searchTerm: string
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${baseUrl}/players?name=${searchTerm}`)
}

export const getPlayersByOwner = async (
    address: string
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${baseUrl}/players?owner=${address}`)
}

export const getExactPlayers = async (
    searchTerm: string
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${baseUrl}/players?exactName=${searchTerm}`)
}

export const getPlayersByIds = async (
    ids: string[],
    numToSkip: number = 0
): Promise<PlayerSearchResult> => {
    return fetchRetry(
        `${baseUrl}/players?numToSkip=${numToSkip}&${ids
            .map((x) => `tokenIds[]=${x}`)
            .join("&")}`
    )
}

export const getSoloPlayerState = async (
    playerId: string
): Promise<PlayerResult> => {
    return fetchRetry(`${baseUrl}/players/${playerId}`)
}

export const getLotteries = async (
    numToSkip: number
): Promise<LotteriesResult> => {
    return fetchRetry(`${baseUrl}/lotteries?numToSkip=${numToSkip}`)
}

export const getRaffleEntries = async (
    numToSkip: number
): Promise<RaffleEntryResult> => {
    return fetchRetry(`${baseUrl}/raffle-entries?numToSkip=${numToSkip}`)
}

export const getClanMembers = async (
    clanId: string
): Promise<ClanMembersResult> => {
    return fetchRetry(`${baseUrl}/clan-members?clanId=${clanId}`)
}

export const getClans = async (numToSkip: number): Promise<ClansResult> => {
    return fetchRetry(`${baseUrl}/clans?numToSkip=${numToSkip}`)
}

export const searchQueuedActions = async (
    playerId: string
): Promise<SearchQueuedActionsResult> => {
    return fetchRetry(
        `${baseUrl}/queued-actions?playerId=${playerId}&isActive=true&orderDirection=asc`
    )
}

export const getTerritories = async (): Promise<TerritoriesResult> => {
    return fetchRetry(`${baseUrl}/territories`)
}

export const getDonations = async (
    numToSkip: number
): Promise<DonationsResult> => {
    return fetchRetry(
        `${baseUrl}/donations?numToSkip=${numToSkip}&orderDirection=desc&orderBy=lastUpdatedTimestamp&useUsers=false`
    )
}

export const getAvatars = async (): Promise<AvatarSearchResult> => {
    return fetchRetry(`${baseUrl}/avatars`)
}

export const getOwnedPets = async (address: string): Promise<PetsResult> => {
    return fetchRetry(`${baseUrl}/pets?owner=${address}`)
}