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

const getBaseUrl = (chainId: 250 | 146) => {
    return chainId === 250
        ? "https://api-fantom.estfor.com"
        : "https://api.estfor.com"
}

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
    chainId: 250 | 146
): Promise<ClanMemberResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/clan-members/${playerId}`)
}

export const getGlobalData = async (
    chainId: 250 | 146
): Promise<CoreDataResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/core-data`)
}

export const getUserItemNFTs = async (
    user: string,
    tokenIds: number[],
    chainId: 250 | 146
): Promise<UserItemNFTResult> => {
    return fetchRetry(
        `${getBaseUrl(chainId)}/user-item-nfts/${user}?${tokenIds
            .map((x) => `tokenIds[]=${x}`)
            .join("&")}`
    )
}

export const getPlayers = async (
    searchTerm: string,
    chainId: 250 | 146
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/players?name=${searchTerm}`)
}

export const getPlayersByOwner = async (
    address: string,
    chainId: 250 | 146
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/players?owner=${address}`)
}

export const getExactPlayers = async (
    searchTerm: string,
    chainId: 250 | 146
): Promise<PlayerSearchResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/players?exactName=${searchTerm}`)
}

export const getPlayersByIds = async (
    ids: string[],
    numToSkip: number = 0,
    chainId: 250 | 146
): Promise<PlayerSearchResult> => {
    return fetchRetry(
        `${getBaseUrl(chainId)}/players?numToSkip=${numToSkip}&${ids
            .map((x) => `tokenIds[]=${x}`)
            .join("&")}`
    )
}

export const getSoloPlayerState = async (
    playerId: string,
    chainId: 250 | 146
): Promise<PlayerResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/players/${playerId}`)
}

export const getLotteries = async (
    numToSkip: number,
    chainId: 250 | 146
): Promise<LotteriesResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/lotteries?numToSkip=${numToSkip}`)
}

export const getRaffleEntries = async (
    numToSkip: number,
    chainId: 250 | 146
): Promise<RaffleEntryResult> => {
    return fetchRetry(
        `${getBaseUrl(chainId)}/raffle-entries?numToSkip=${numToSkip}`
    )
}

export const getClanMembers = async (
    clanId: string,
    chainId: 250 | 146
): Promise<ClanMembersResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/clan-members?clanId=${clanId}`)
}

export const getClans = async (
    numToSkip: number,
    chainId: 250 | 146
): Promise<ClansResult> => {
    return fetchRetry(
        `${getBaseUrl(chainId)}/clans?numToSkip=${numToSkip}&onlyHasVaults=true`
    )
}

export const getClanByName = async (
    name: string,
    chainId: 250 | 146
): Promise<ClansResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/clans?name=${name}`)
}

export const searchQueuedActions = async (
    playerId: string,
    chainId: 250 | 146
): Promise<SearchQueuedActionsResult> => {
    return fetchRetry(
        `${getBaseUrl(
            chainId
        )}/queued-actions?playerId=${playerId}&isActive=true&orderDirection=asc`
    )
}

export const getTerritories = async (
    chainId: 250 | 146
): Promise<TerritoriesResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/territories`)
}

export const getDonations = async (
    numToSkip: number,
    chainId: 250 | 146
): Promise<DonationsResult> => {
    return fetchRetry(
        `${getBaseUrl(
            chainId
        )}/donations?numToSkip=${numToSkip}&orderDirection=desc&orderBy=lastUpdatedTimestamp&useUsers=false`
    )
}

export const getAvatars = async (
    chainId: 250 | 146
): Promise<AvatarSearchResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/avatars`)
}

export const getOwnedPets = async (
    address: string,
    chainId: 250 | 146
): Promise<PetsResult> => {
    return fetchRetry(`${getBaseUrl(chainId)}/pets?owner=${address}`)
}
