import { ActionInput, CombatStats, GuaranteedReward, RandomReward, Skill } from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allActions } from '../data/actions'
import { useItemStore } from "./items"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { MEDIA_URL, useCoreStore } from "./core"

export interface MonsterState {
    monsters: ActionInput[]
}

export interface MonsterRank {
    name: string,
    damagePerMinute: number,
    damageTakenPerHour: number,
    xpPerHour: number,
    imgSource: string,
    meleeDamagePerMinute: number,
    rangedDamagePerMinute: number,
    magicDamagePerMinute: number,
    fishRequiredPerHour: number,
    combatStats: CombatStats,
    guaranteedRewards: GuaranteedReward[],
    randomRewards: RandomReward[],
}

const calculateDamage = (atk: number, def: number) => {
    if (atk === 0) return 0
    def = Math.max(atk * -1, def)
    let damage = (atk * 3) - def
    return Math.max(1, damage)
}

export const monsterNames = {
    [EstforConstants.ACTION_COMBAT_NATUOW]: "Natuow",
    [EstforConstants.ACTION_COMBAT_ANCIENT_ENT]: "Ancient Ent",
    [EstforConstants.ACTION_COMBAT_ARCANE_DRAGON]: "Arcane Dragon",
    [EstforConstants.ACTION_COMBAT_BANOXNID]: "Banoxnid",
    [EstforConstants.ACTION_COMBAT_DRAGON_FROG]: "Dragon Frog",
    [EstforConstants.ACTION_COMBAT_DWELLER_BAT]: "Dweller Bat",
    [EstforConstants.ACTION_COMBAT_ELDER_BURGOF]: "Elder Burgof",
    [EstforConstants.ACTION_COMBAT_ELEMENTAL_DRAGON]: "Elemental Dragon",
    [EstforConstants.ACTION_COMBAT_ERKAD]: "Erkad",
    [EstforConstants.ACTION_COMBAT_GRAND_TREE_IMP]: "Grand Tree Imp",
    [EstforConstants.ACTION_COMBAT_GROG_TOAD]: "Grog Toad",
    [EstforConstants.ACTION_COMBAT_LOSSUTH]: "Lossuth",
    [EstforConstants.ACTION_COMBAT_NATURARACNID]: "Naturaracnid",
    [EstforConstants.ACTION_COMBAT_OBGORA]: "Obgora",
    [EstforConstants.ACTION_COMBAT_QRAKUR]: "Qrakur",
    [EstforConstants.ACTION_COMBAT_QUARTZ_EAGLE]: "Quartz Eagle",
    [EstforConstants.ACTION_COMBAT_ROCKHAWK]: "Rockhawk",
    [EstforConstants.ACTION_COMBAT_SNAPPER_BUG]: "Snapper Bug",
    [EstforConstants.ACTION_COMBAT_SNUFFLEQUARG]: "Snufflequarg",
    [EstforConstants.ACTION_COMBAT_SQUIGGLE_EGG]: "Squiggle Egg",
    [EstforConstants.ACTION_COMBAT_UFFINCH]: "Uffinch",
}

export const monsterImageMap = {
    [EstforConstants.ACTION_COMBAT_NATUOW]: "monster_1_9zp1zn5o.jpg",
    [EstforConstants.ACTION_COMBAT_ANCIENT_ENT]: "monster_13_1fng96z1.jpg",
    [EstforConstants.ACTION_COMBAT_ARCANE_DRAGON]: "monster_3_th8l97g7.jpg",
    [EstforConstants.ACTION_COMBAT_BANOXNID]: "monster_9_lnrj57lu.jpg",
    [EstforConstants.ACTION_COMBAT_DRAGON_FROG]: "monster_2_t0stkk6h.jpg",
    [EstforConstants.ACTION_COMBAT_DWELLER_BAT]: "monster_18_wvkn2m5k.jpg",
    [EstforConstants.ACTION_COMBAT_ELDER_BURGOF]: "monster_12_yc0go5us.jpg",
    [EstforConstants.ACTION_COMBAT_ELEMENTAL_DRAGON]: "monster_4_huk1fhyk.jpg",
    [EstforConstants.ACTION_COMBAT_ERKAD]: "monster_15_bk1qmdjg.jpg",
    [EstforConstants.ACTION_COMBAT_GRAND_TREE_IMP]: "monster_10_w5jrjsdm.jpg",
    [EstforConstants.ACTION_COMBAT_GROG_TOAD]: "monster_6_4j6ln0up.jpg",
    [EstforConstants.ACTION_COMBAT_LOSSUTH]: "monster_21_d78nqouq.jpg",
    [EstforConstants.ACTION_COMBAT_NATURARACNID]: "monster_8_m1jngtk4.jpg",
    [EstforConstants.ACTION_COMBAT_OBGORA]: "monster_20_xzg4p2ow.jpg",
    [EstforConstants.ACTION_COMBAT_QRAKUR]: "monster_19_0c71r8c4.jpg",
    [EstforConstants.ACTION_COMBAT_QUARTZ_EAGLE]: "monster_16_pd6tft1a.jpg",
    [EstforConstants.ACTION_COMBAT_ROCKHAWK]: "monster_17_wvkn2m5k.jpg",
    [EstforConstants.ACTION_COMBAT_SNAPPER_BUG]: "monster_7_z8jt6i8q.jpg",
    [EstforConstants.ACTION_COMBAT_SNUFFLEQUARG]: "monster_11_ddmkmh7y.jpg",
    [EstforConstants.ACTION_COMBAT_SQUIGGLE_EGG]: "monster_14_5tnfLn.jpg",
    [EstforConstants.ACTION_COMBAT_UFFINCH]: "monster_5_jltmx4zq.jpg",
}

export const useMonsterStore = defineStore({
    id: "monsters",
    state: () =>
        ({
            monsters: allActions.filter(x => x.info.skill === Skill.COMBAT) as ActionInput[],
        } as MonsterState),
    getters: {
        getMonsterRankings: (state: MonsterState) => {
            return (hours: number) => {
                const coreStore = useCoreStore()
                const itemStore = useItemStore()

                const equippedItems = itemStore.equippedItems.find(x => x.playerId === Number(coreStore.playerId))
                
                let isMelee = itemStore.items.find(x => x.tokenId === equippedItems?.rightHand)?.skill === Skill.MELEE || false
                let isRanged = itemStore.items.find(x => x.tokenId === equippedItems?.rightHand)?.skill === Skill.RANGED || false
                let isMagic = itemStore.items.find(x => x.tokenId === equippedItems?.rightHand)?.skill === Skill.MAGIC || false

                const combatStats = itemStore.getTotalCombatStats

                const attackSkill = isMelee ? combatStats.melee : isRanged ? combatStats.ranged : isMagic ? combatStats.magic : 0
                const monsterRankings = []
                const elapsedTime = hours * 3600

                for (const m of state.monsters) {
                    const damagePerMinute = calculateDamage(attackSkill, isMelee ? m.combatStats.meleeDefence : isRanged ? m.combatStats.rangedDefence : isMagic ? m.combatStats.magicDefence : 0)
                    const meleeDamagePerMinute = calculateDamage(m.combatStats.melee, combatStats.meleeDefence)
                    const rangedDamagePerMinute = calculateDamage(m.combatStats.ranged, combatStats.rangedDefence)
                    const magicDamagePerMinute = calculateDamage(m.combatStats.magic, combatStats.magicDefence)
                    const damageTakenPerMinute = meleeDamagePerMinute + rangedDamagePerMinute + magicDamagePerMinute

                    // Step 1 and 3 from https://github.com/PaintSwap/estfor-contracts/blob/main/contracts/Players/PlayersLibrary.sol getCombatAdjustedElapsedTimes
                    const totalMonstersSpawned = m.info.numSpawned * hours
                    const respawnTime = (elapsedTime * 1000) / totalMonstersSpawned
                    const damageDealt = (damagePerMinute * respawnTime) / 60                
                    const combatTimePerKill = Math.ceil((m.combatStats.health * 60) / damagePerMinute)
                    const canKillAll = damageDealt > m.combatStats.health
                    let numKilled = 0
                    let combatElapsedTime = 0
                    if (canKillAll) {
                        numKilled = (elapsedTime * totalMonstersSpawned) / (elapsedTime * 1000)
                        const combatTimePerEnemy = Math.ceil((m.combatStats.health * respawnTime) / damageDealt)
                        combatElapsedTime = combatTimePerEnemy * numKilled
                        combatElapsedTime += Math.min(combatTimePerEnemy, (elapsedTime - respawnTime) * numKilled)
                    } else {
                        numKilled = elapsedTime / combatTimePerKill
                        combatElapsedTime = elapsedTime
                    }

                    const xpElapsedTime = respawnTime * numKilled

                    let totalHealthLost = (damageTakenPerMinute * combatElapsedTime) / 60
                    if (totalHealthLost > combatStats.health) {
                        totalHealthLost -= Math.max(0, combatStats.health)
                    } else {
                        totalHealthLost = 0
                    }

                    const fishHealthRestored = itemStore.items.find(x => x.tokenId === equippedItems?.food)?.healthRestored || 0
                    const totalFoodRequired = Math.ceil(totalHealthLost / fishHealthRestored)
                    const xpPerHour = (m.info.xpPerHour * xpElapsedTime) / elapsedTime
                    
                    monsterRankings.push({
                        actionId: m.actionId,
                        name: monsterNames[m.actionId] || 'Unknown',
                        damagePerMinute,
                        damageTakenPerHour: totalHealthLost,
                        meleeDamagePerMinute,
                        rangedDamagePerMinute,
                        magicDamagePerMinute,
                        xpPerHour,
                        combatStats: m.combatStats,
                        fishRequiredPerHour: totalFoodRequired,
                        imgSource: `${MEDIA_URL}/monsters/${monsterImageMap[m.actionId] || 'monster_1_9zp1zn5o.jpg'}`,
                        guaranteedRewards: m.guaranteedRewards,
                        randomRewards: m.randomRewards,
                    })
                }

                monsterRankings.sort((a, b) => {
                    if (b.xpPerHour > a.xpPerHour)
                        return 1
                    if (b.xpPerHour < a.xpPerHour)
                        return -1

                    if (b.damageTakenPerHour > a.damageTakenPerHour)
                        return -1
                    if (b.damageTakenPerHour < a.damageTakenPerHour)
                        return 1
                    
                    return 0
                })
                return monsterRankings
            }
        },
    },
    actions: {
    },
})