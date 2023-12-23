<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto md:w-[650px]">
        <div class="card-body">
            <h3 class="font-bold text-lg text-center">Clan Battle Simulator</h3>
            <p class="mt-5">Select the clans and their members to simulate multiple battles for a territory and find out your chances to win.</p>
            <p class="mt-5">Rules of battle:</p>
            <ol class="list-decimal list-inside">
                <li>Clans post a maximum of 20 members to a battle</li>
                <li>If one clan has more members in a battle, the extra members will auto-win their roll</li>
                <li>Clan members fight a single member from the opposing clan in a random skill</li>
                <li>Clan members get 1 dice plus an additional dice for every 20 levels in that skill</li>
                <!-- <li>Highest number rolled on all dice is the winner</li> -->
                <li>Random byte array is rolled for each member (e.g. 0, 1, 1, 0, 1, 0, 0, 1) and the dice rolls equate to the number of bits you get from the byte. For example, if you have 2 dice rolls you get 2 numbers from right to left (resulting in a score of 1). If you have 4 dice rolls you get 4 numbers from right to left (resulting in a score of 2 in the example byte). Highest score wins</li>
                <li>Clan with the most wins captures the territory (or the defender wins if it's a draw)</li>
            </ol>
            <div class="flex justify-start mt-5">
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">Simulations</span>
                    </div>
                    <input type="number" step="1" min="1" max="1000" class="input input-sm input-bordered bg-base-100-50" v-model="simulationCount" />
                </label>
            </div>
            <button type="button" class="btn btn-primary" :disabled="!clanASelectionValid || !clanBSelectionValid" @click.prevent="simulateBattles">Calculate Battles</button>
            <div v-if="simulationComplete" class="mt-5 text-right">
                As the attacker, {{ clanANameFixed }} wins <span class="text-xl" :class="{'text-error': clanASimulationWinPercentage < clanBSimulationWinPercentage, 'text-green-400': clanASimulationWinPercentage > clanBSimulationWinPercentage}">{{ clanASimulationWinPercentage }}</span>% of the time
                <br />
                As the defender, {{ clanBNameFixed }} wins <span class="text-xl" :class="{'text-error': clanASimulationWinPercentage > clanBSimulationWinPercentage, 'text-green-400': clanASimulationWinPercentage < clanBSimulationWinPercentage}">{{ clanBSimulationWinPercentage }}</span>% of the time
            </div>
        </div>
    </div>

    <div class="flex max-xl:flex-col flex-row justify-evenly xl:gap-10">
        <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10 grow">
            <div class="card-body">
                <ClanSearch class="w-full" @update:model-value="onUpdateClanA" v-model="clanAName" />
                <div class="overflow-x-auto">
                    <table class="table md:table-md table-xs">
                        <caption v-if="!loadingA && clanANameFixed" class="caption-top mb-5 text-lg" :class="{'text-error': !clanASelectionValid}">
                            {{ clanANameFixed }} - Attackers ({{ clanARanked.filter(x => x.selected).length }} / 20)
                        </caption>
                        <thead>
                        <tr>
                            <th class="w-[80px]"></th>
                            <th class="w-[80px] text-center">Avatar</th>
                            <th>Name</th>
                            <th class="text-right">Dice Rolls</th>
                        </tr>
                        </thead>
                        <tbody v-if="loadingA" class="mx-auto my-[100px] w-full text-center">
                            <tr><td colspan="3"><span class="loading loading-spinner text-primary loading-md mx-auto"></span></td></tr>
                        </tbody>
                        <tbody v-else>
                        <tr v-for="p in clanARanked" :key="p.id" @click.prevent="p.selected = !p.selected" class="cursor-pointer hover:bg-base-100-50">
                            <td class="text-center">
                                <input type="checkbox" class="checkbox checkbox-primary" v-model="p.selected" />
                            </td>                          
                            <td class="avatar">
                                <div class="mask mask-square rounded-lg w-12 h-12">
                                    <img :src="`https://media.estfor.com/characters/${p.avatarId}.jpg`" />
                                </div>
                            </td>
                            <td>{{ p.name }}</td>
                            <td class="text-right">{{ p.diceRolls}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10 grow">
            <div class="card-body">
                <ClanSearch class="w-full" @update:model-value="onUpdateClanB" v-model="clanBName" />
                <div class="overflow-x-auto">
                    <table class="table md:table-md table-xs">
                        <caption v-if="!loadingB && clanBNameFixed" class="caption-top mb-5 text-lg" :class="{'text-error': !clanBSelectionValid}">
                            {{ clanBNameFixed }} - Defenders ({{ clanBRanked.filter(x => x.selected).length }} / 20)
                        </caption>
                        <thead>
                        <tr>
                            <th class="w-[80px]"></th>
                            <th class="w-[80px] text-center">Avatar</th>
                            <th>Name</th>
                            <th class="text-right">Dice Rolls</th>
                        </tr>
                        </thead>
                        <tbody v-if="loadingB" class="mx-auto my-[100px] w-full text-center">
                            <tr><td colspan="3"><span class="loading loading-spinner text-primary loading-md mx-auto"></span></td></tr>
                        </tbody>
                        <tbody v-else>
                        <tr v-for="p in clanBRanked" :key="p.id" @click.prevent="p.selected = !p.selected" class="cursor-pointer hover:bg-base-100-50">
                            <td class="text-center">
                                <input type="checkbox" class="checkbox checkbox-primary" v-model="p.selected" />
                            </td>    
                            <td class="avatar">
                                <div class="mask mask-square rounded-lg w-12 h-12">
                                    <img :src="`https://media.estfor.com/characters/${p.avatarId}.jpg`" />
                                </div>
                            </td>
                            <td>{{ p.name }}</td>
                            <td class="text-right">{{ p.diceRolls}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { getLevel, useCoreStore } from "../store/core"
import { useClanStore } from "../store/clan"
import { getClanMembers } from "../utils/api"
import { Player } from "@paintswap/estfor-definitions/types"
import ClanSearch from "./inputs/ClanSearch.vue"

const coreStore = useCoreStore()
const clanStore = useClanStore()

const loadingA = ref(false)
const loadingB = ref(false)

const simulationCount = ref(10000)

const clanA = ref<Player[]>([])
const clanAName = ref('')
const clanANameFixed = ref('')

const clanB = ref<Player[]>([])
const clanBName = ref('')
const clanBNameFixed = ref('')
const simulationComplete = ref(false)
const clanASimulationWinPercentage = ref('0')
const clanBSimulationWinPercentage = ref('0')

const getDiceRollForRank = (rank: number) => {
    // get 1 dice roll every 20 ranks, start with 1 by default
    return Math.floor(rank / 20) + 1
}

const getDiceRolls = (player: Player) => {
    let diceRolls = 0
    diceRolls += getDiceRollForRank(getLevel(player.woodcuttingXP))
    diceRolls += getDiceRollForRank(getLevel(player.miningXP))
    diceRolls += getDiceRollForRank(getLevel(player.fishingXP))
    diceRolls += getDiceRollForRank(getLevel(player.cookingXP))
    diceRolls += getDiceRollForRank(getLevel(player.smithingXP))
    diceRolls += getDiceRollForRank(getLevel(player.fletchingXP))
    diceRolls += getDiceRollForRank(getLevel(player.craftingXP))
    diceRolls += getDiceRollForRank(getLevel(player.healthXP))
    diceRolls += getDiceRollForRank(getLevel(player.meleeXP))
    diceRolls += getDiceRollForRank(getLevel(player.defenceXP))
    diceRolls += getDiceRollForRank(getLevel(player.rangedXP))
    diceRolls += getDiceRollForRank(getLevel(player.magicXP))
    diceRolls += getDiceRollForRank(getLevel(player.alchemyXP))
    diceRolls += getDiceRollForRank(getLevel(player.firemakingXP))
    diceRolls += getDiceRollForRank(getLevel(player.thievingXP))
    diceRolls += getDiceRollForRank(getLevel(player.forgingXP))
    return diceRolls
}

const clanARanked = ref<any[]>([])
const clanBRanked = ref<any[]>([])

const clanASelectionValid = computed(() => clanARanked.value.filter(x => x.selected).length <= 20 && clanARanked.value.filter(x => x.selected).length > 0)
const clanBSelectionValid = computed(() => clanBRanked.value.filter(x => x.selected).length <= 20 && clanBRanked.value.filter(x => x.selected).length > 0)

const loadClanA = async (id: string) => {    
    const clanMembersResult = await getClanMembers(id)
    clanA.value = clanMembersResult.clanMembers.map(x => x.player)
    clanARanked.value = clanA.value.map((x) => {
        return {
            ...x,
            diceRolls: getDiceRolls(x),
        }    
    })
    .sort((a, b) => b.diceRolls > a.diceRolls ? 1 : b.diceRolls < a.diceRolls ? -1 : 0)
    .map((x, i) => {
        return {
            ...x,
            selected: i < 20
        }
    })
    clanANameFixed.value = clanMembersResult.clanMembers[0]?.clan?.name || ''
}

const loadClanB = async (id: string) => {    
    const clanMembersResult = await getClanMembers(id)
    clanB.value = clanMembersResult.clanMembers.map(x => x.player)
    clanBRanked.value = clanB.value.map((x) => {
        return {
            ...x,
            diceRolls: getDiceRolls(x),
        }    
    })
    .sort((a, b) => b.diceRolls > a.diceRolls ? 1 : b.diceRolls < a.diceRolls ? -1 : 0)
    .map((x, i) => {
        return {
            ...x,
            selected: i < 20
        }
    })
    clanBNameFixed.value = clanMembersResult.clanMembers[0]?.clan?.name || ''
}

const onUpdateClanA = async (name: string) => {
    const clanId = clanStore.clans.find(x => x.name.toLowerCase() === name.toLowerCase())?.id
    if (clanId) {
        simulationComplete.value = false
        loadingA.value = true
        await loadClanA(clanId)
        loadingA.value = false
    }
}

const onUpdateClanB = async (name: string) => {
    const clanId = clanStore.clans.find(x => x.name.toLowerCase() === name.toLowerCase())?.id
    if (clanId) {
        simulationComplete.value = false
        loadingB.value = true
        await loadClanB(clanId)
        loadingB.value = false
    }
}

const simulateBattles = async () => {
    const clanAMembers = clanARanked.value.filter(x => x.selected)
    const clanBMembers = clanBRanked.value.filter(x => x.selected)

    // pad out the smaller clan with auto-losses
    if (clanAMembers.length < clanBMembers.length) {
        const difference = clanBMembers.length - clanAMembers.length
        for (let i = 0; i < difference; i++) {
            clanAMembers.push({
                diceRolls: 0
            })
        }
    } else if (clanBMembers.length < clanAMembers.length) {
        const difference = clanAMembers.length - clanBMembers.length
        for (let i = 0; i < difference; i++) {
            clanBMembers.push({
                diceRolls: 0
            })
        }
    }

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const getByteArray = () => {
        const byteArray = []
        // create an array of random 0 and 1s of length 8
        for (let i = 0; i < 8; i++) {
            byteArray.push(Math.round(Math.random()))
        }
        return byteArray
    }

    let clanATotalWins = 0
    let clanBTotalWins = 0

    for (let i = 0; i < simulationCount.value; i++) {
        let clanAWins = 0
        let clanBWins = 0

        // shuffle member arrays
        shuffleArray(clanAMembers)
        shuffleArray(clanBMembers)

        // make an array of skills the same length as clan members
        const skills = [
            'woodcuttingXP',
            'miningXP',
            'fishingXP',
            'cookingXP',
            'smithingXP',
            'fletchingXP',
            'craftingXP',
            'healthXP',
            'meleeXP',
            'defenceXP',
            'rangedXP',
            'magicXP',
            'alchemyXP',
            'firemakingXP',
            'thievingXP',
            'forgingXP',
        ]

        const skillsArray = []
        for (let j = 0; j < clanAMembers.length; j++) {
            // pick random skill and push to skillsArray
            const skill = skills[Math.floor(Math.random() * skills.length)]
            skillsArray.push(skill)
        }

        // loop through clan members and roll dice
        for (let j = 0; j < clanAMembers.length; j++) {
            const clanAMember = clanAMembers[j]
            const clanBMember = clanBMembers[j]

            if (clanAMember.diceRolls === 0) {
                // auto-loss
                clanBWins++
                continue
            }

            if (clanBMember.diceRolls === 0) {
                // auto-loss
                clanAWins++
                continue
            }

            // each dice roll is a d20. make an array of d20 dice rolls and the highest number wins
            let highestADiceRoll = 0
            let highestBDiceRoll = 0

            const clanAMemberDiceRoll = getDiceRollForRank(getLevel(clanAMember[skillsArray[j]]))
            const clanBMemberDiceRoll = getDiceRollForRank(getLevel(clanBMember[skillsArray[j]]))

            const clanAByteArray = getByteArray()
            const clanBByteArray = getByteArray()

            for (let k = 0; k < clanAMemberDiceRoll; k++) {
                // the following is based on a d20 roll
                // const diceRoll = Math.floor(Math.random() * 20) + 1
                // if (diceRoll > highestADiceRoll) {
                //     highestADiceRoll = diceRoll
                // }

                highestADiceRoll += clanAByteArray[k] === 1 ? 1 : 0
            }

            for (let k = 0; k < clanBMemberDiceRoll; k++) {
                // the following is based on a d20 roll
                // const diceRoll = Math.floor(Math.random() * 20) + 1
                // if (diceRoll > highestBDiceRoll) {
                //     highestBDiceRoll = diceRoll
                // }

                highestBDiceRoll += clanBByteArray[k] === 1 ? 1 : 0
            }

            if (highestADiceRoll > highestBDiceRoll) {
                clanAWins++
            } else if (highestBDiceRoll > highestADiceRoll) {
                clanBWins++
            }
        }

        if (clanAWins > clanBWins) {
            clanATotalWins++
        } else if (clanBWins > clanAWins) {
            clanBTotalWins++
        } else {
            // draw, defender wins
            clanBTotalWins++
        }
    }

    clanASimulationWinPercentage.value = ((clanATotalWins / simulationCount.value) * 100).toFixed(1)
    clanBSimulationWinPercentage.value = ((clanBTotalWins / simulationCount.value) * 100).toFixed(1)
    simulationComplete.value = true
}

const init = async () => {
    loadingA.value = true

    await clanStore.getAllClans()
    if (coreStore.clanState) {
        await loadClanA(coreStore.clanState.id)
    }

    loadingA.value = false
}

onMounted(init)

</script>