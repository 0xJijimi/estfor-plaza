import { ActionInput, RandomReward } from "@paintswap/estfor-definitions/types"
import { getLevel } from "../store/core"

export const calculateChance = (
    r: RandomReward,
    a: ActionInput,
    playerXp: string
) => {
    return (
        (r.chance *
            Math.min(
                90,
                a.info.successPercent +
                    Math.max(0, getLevel(playerXp) - getLevel(a.info.minXP))
            )) /
        65535
    )
}
