import { Player, QueuedAction, UserItemNFT } from "@paintswap/estfor-definitions/types"

export interface SavedTransaction {
    to: string
    data: any
}

export interface ProxySilo {
    address: string
    owner: string
    index: number
    allPlayers: Player[]
    playerId: string
    playerState: Player
    isPaused: boolean
    savedTransactions: SavedTransaction[]
    queuedActions: QueuedAction[]
}

export interface FactoryState {
    proxys: ProxySilo[]
    bankItems: UserItemNFT[]
    initialised: boolean
    initialisedAt: Date | null
    totalTransactionNumber: number
    currentTransactionNumber: number
    transactionCharge: bigint
}

export interface AggregatedItem {
    rate: number
    outgoingRate: number
    amount: string
    tokenId: number
}

export interface NeededItem {
    address: string
    items: { tokenId: number; amount: number }[]
}

export interface TransferUserItemNFT extends UserItemNFT {
    transferAmount: number
}