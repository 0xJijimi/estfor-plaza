import { defineStore } from "pinia"
import { account, readContract, } from '@kolirt/vue-web3-auth'

import estforPlayerAbi from '../abi/estforPlayer.json'
import { Player, getPlayerState } from "../utils/api"

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
        } as CoreState),
    getters: {
        getNetworkAddressMap: (state: CoreState): AddressMap[] | undefined => {
            return state.addresses.find(x => x.network == state.connectedNetwork)?.addresses;
        },
        getAddress: (state: CoreState) => {
            return (name: Address) => state.addresses.find(x => x.network == state.connectedNetwork)?.addresses.find(x => x.name == name)?.address;  
        },
    },
    actions: {
        setCurrentNetwork(network: Network) {         
            this.connectedNetwork = network
            this.disconnect()
        },
        disconnect() {
            // reset state         
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
            this.playerState = playerState.player
        },
    },
})
