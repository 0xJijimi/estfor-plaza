import { getAccount, readContract, writeContract } from "@wagmi/core"
import { defineStore } from "pinia"
import { HOMEMADE_BROOCH_ADDRESS } from "../utils/addresses"
import broochAbi from '../abi/brooch.json'
import { solidityPacked } from "ethers"

export interface Brooch {
    balance: number
    totalSupply: number
    baseTokenPrice: number
}

export interface BroochState {
    brooches: Brooch[]
}

export const useBroochStore = defineStore({
    id: "brooch",
    state: () =>
        ({
            brooches: [] as Brooch[],
        } as BroochState),
    getters: {
        brooch(state: BroochState) {
            return (tokenId: number) => {
                return state.brooches[tokenId] || {
                    balance: 0,
                    totalSupply: 0,
                    baseTokenPrice: 0,
                }
            }
        },
    },
    actions: {
        async getBroochData(tokenId: number) {
            const account = getAccount()
            const result = await Promise.all([
                readContract({
                    address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                    abi: broochAbi,
                    functionName: 'tokenSupply',
                    args: [0],
                }),
                readContract({
                    address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                    abi: broochAbi,
                    functionName: 'baseTokenPrice',
                    args: [0],
                }),
                readContract({
                    address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                    abi: broochAbi,
                    functionName: 'balanceOf',
                    args: [account.address, 0],
                }),
            ])
            const brooch = this.brooches[tokenId] || {}
            brooch.totalSupply = result[0] as unknown as number
            brooch.baseTokenPrice = result[1] as unknown as number
            brooch.balance = result[2] as unknown as number

            this.brooches[tokenId] = brooch
        },
        mintNFT(tokenId: number) {
            const account = getAccount()
            return writeContract({
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: 'mintBatch',
                args: [account.address, [0], [1], solidityPacked(['bytes'], ['0x'])],
                value: (BigInt(this.brooches[tokenId]?.totalSupply) * BigInt(10 ** 18)) + BigInt(this.brooches[tokenId]?.baseTokenPrice),                
            })
        }
    },
})
