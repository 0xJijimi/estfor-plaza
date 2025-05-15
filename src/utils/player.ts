import { ActionInput, Player, RandomReward } from "@paintswap/estfor-definitions/types"
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

export const getHeroClass = (playerState: Player) => {
    const alchemyLevel = getLevel(playerState.alchemyXP)
    const meleeLevel = getLevel(playerState.meleeXP)
    const rangedLevel = getLevel(playerState.rangedXP)
    const magicLevel = getLevel(playerState.magicXP)
    const defenceLevel = getLevel(playerState.defenceXP)
    const farmingLevel = getLevel(playerState.farmingXP)
    const fishingLevel = getLevel(playerState.fishingXP)
    const forgeLevel = getLevel(playerState.forgingXP)
    const craftingLevel = getLevel(playerState.craftingXP)
    const woodcuttingLevel = getLevel(playerState.woodcuttingXP)
    const miningLevel = getLevel(playerState.miningXP)
    const cookingLevel = getLevel(playerState.cookingXP)
    const smithingLevel = getLevel(playerState.smithingXP)
    const fletchingLevel = getLevel(playerState.fletchingXP)
    const thievingLevel = getLevel(playerState.thievingXP)
    const firemakingLevel = getLevel(playerState.firemakingXP)

    const highestLevel = Math.max(alchemyLevel, meleeLevel, rangedLevel, magicLevel, defenceLevel, farmingLevel, fishingLevel, forgeLevel, craftingLevel, woodcuttingLevel, miningLevel, cookingLevel, smithingLevel, fletchingLevel, thievingLevel, firemakingLevel)
    
    // compare highest level to each class level
    if (highestLevel === alchemyLevel) {
        return `Alchemist (${alchemyLevel})`
    } else if (highestLevel === meleeLevel) {
        return `Warrior (${meleeLevel})`
    } else if (highestLevel === rangedLevel) {
        return `Archer (${rangedLevel})`
    } else if (highestLevel === magicLevel) {
        return `Mage (${magicLevel})`
    } else if (highestLevel === defenceLevel) {
        return `Defender (${defenceLevel})`
    } else if (highestLevel === farmingLevel) {
        return `Farmer (${farmingLevel})`
    } else if (highestLevel === fishingLevel) {
        return `Fisherman (${fishingLevel})`
    } else if (highestLevel === forgeLevel) {
        return `Forger (${forgeLevel})`
    } else if (highestLevel === craftingLevel) {
        return `Crafter (${craftingLevel})`
    } else if (highestLevel === woodcuttingLevel) {
        return `Lumberjack (${woodcuttingLevel})`
    } else if (highestLevel === miningLevel) {
        return `Miner (${miningLevel})`
    } else if (highestLevel === cookingLevel) {
        return `Cook (${cookingLevel})`
    } else if (highestLevel === smithingLevel) {
        return `Blacksmith (${smithingLevel})`
    } else if (highestLevel === fletchingLevel) {
        return `Fletcher (${fletchingLevel})`
    } else if (highestLevel === thievingLevel) {
        return `Thief (${thievingLevel})`
    } else if (highestLevel === firemakingLevel) {
        return `Firemaker (${firemakingLevel})`
    }
    return "Unknown"
}