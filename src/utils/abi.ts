import { Interface, Result } from "ethers"

export const decode = (data: any, functionName: string, abi: any): Result => {
    const i = new Interface(abi)
    return i.decodeFunctionData(functionName, data)
}
