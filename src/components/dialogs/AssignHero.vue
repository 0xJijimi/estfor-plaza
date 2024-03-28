<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                Assign {{ heroesToAssign.length }} Hero{{
                    heroesToAssign.length === 1 ? "" : "es"
                }}
            </h3>

            <SkillSelect
                class="mt-5"
                v-model="skillId"
                @update:model-value="actionId = 0"
            />
            <ActionInputSelect
                v-if="
                    skillId > 0 &&
                    skillStore.getActionInputsForSkill(skillId).length > 0
                "
                class="mt-5"
                v-model="actionId"
                :skill-id="skillId"
                :heroes="heroesToAssign"
                @update:model-value="checkRequiredItems"
            />
            <ActionChoiceInputSelect
                v-if="
                    skillId > 0 &&
                    skillStore.getActionChoiceInputsForSkill(skillId).length > 0
                "
                class="mt-5"
                v-model="actionChoiceOutputId"
                :skill-id="skillId"
                :heroes="heroesToAssign"
                @update:model-value="checkActionChoiceRequiredItems"
            />
            <ActionQueueStatusSelect class="mt-5" v-model="queueStatus" />

            <label class="label cursor-pointer mt-5">
                <span class="label-text text-xs mr-2 items-center flex">
                    Set Active
                    <div
                        class="tooltip tooltip-primary tooltip-right ml-2"
                        data-tip="Active silos allows anyone to execute the assigned actions. Paused silos will not execute any actions."
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-5 h-5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                            />
                        </svg>
                    </div>
                </span>
                <input
                    type="checkbox"
                    class="checkbox checkbox-primary"
                    v-model="active"
                />
            </label>
            <div
                v-for="item in missingItems"
                :key="item"
                class="text-error text-sm"
            >
                {{ item }}
            </div>
            <div v-if="checking" class="flex justify-between items-center mt-5">
                <span
                    >Checking all heroes have the correct items for
                    action...</span
                >
                <span class="loading loading-spinner loading-md mx-auto"></span>
            </div>
            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="assignHeroes"
                :disabled="
                    loading ||
                    missingItems.length > 0 ||
                    (actionId === 0 && actionChoiceOutputId === 0)
                "
            >
                Assign {{ heroesToAssign.length }} Hero{{
                    heroesToAssign.length === 1 ? "" : "es"
                }}
                to {{ skillNames[skillId] || "" }}
                {{ actionNames[actionId] || "" }}
            </button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { actionNames, skillNames, useSkillStore } from "../../store/skills"
import { itemNames } from "../../store/items"
import { allActions } from "../../data/actions"
import { ActionQueueStatus, Skill } from "@paintswap/estfor-definitions/types"
import { ProxySilo, useFactoryStore } from "../../store/factory"
import SkillSelect from "../inputs/SkillSelect.vue"
import ActionInputSelect from "../inputs/ActionInputSelect.vue"
import ActionChoiceInputSelect from "../inputs/ActionChoiceInputSelect.vue"
import { getUserItemNFTs } from "../../utils/api"
import { useAppStore } from "../../store/app"
import ActionQueueStatusSelect from "../inputs/ActionQueueStatusSelect.vue"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const skillId = ref(Skill.NONE)
const queueStatus = ref(ActionQueueStatus.KEEP_LAST_IN_PROGRESS)
const actionId = ref(0)
const actionChoiceOutputId = ref(0)
const skillStore = useSkillStore()
const factoryStore = useFactoryStore()
const app = useAppStore()

const loading = ref(false)
const checking = ref(false)
const active = ref(true)
const heroesToAssign = ref<ProxySilo[]>([])
const missingItems = ref<string[]>([])
const rightHandItems = ref<number[]>([])

const openDialog = (heroes: ProxySilo[]) => {
    heroesToAssign.value = heroes
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const checkRequiredItems = async () => {
    missingItems.value = []
    rightHandItems.value = []
    loading.value = true
    checking.value = true
    try {
        if (actionId.value > 0) {
            const action = allActions.find((x) => x.actionId == actionId.value)
            const max = action?.info.handItemTokenIdRangeMax
            const min = action?.info.handItemTokenIdRangeMin

            // get an array of numbers between min and max (inclusive)
            const requiredItems = Array.from(
                { length: max - min + 1 },
                (_, i) => i + min
            )

            if (requiredItems.some((x) => x > 0)) {
                for (const h of heroesToAssign.value) {
                    const userItemsResult = await getUserItemNFTs(h.address, [])
                    if (
                        !userItemsResult.userItemNFTs.some((x) =>
                            requiredItems.includes(x.tokenId)
                        )
                    ) {
                        missingItems.value.push(
                            `${h.playerState.name} is missing ${itemNames[min]}`
                        )
                    }
                    // find first item in the requiredItems array that the user has
                    rightHandItems.value.push(
                        userItemsResult.userItemNFTs.find((x) =>
                            requiredItems.includes(x.tokenId)
                        )?.tokenId || 0
                    )
                }
            }
        }
    } catch {
    } finally {
        loading.value = false
        checking.value = false
    }
}

const checkActionChoiceRequiredItems = async () => {
    missingItems.value = []
    rightHandItems.value = []
    loading.value = true
    checking.value = true
    try {
        if (actionChoiceOutputId.value > 0) {
            const action = allActions.find((x) => x.info.skill == skillId.value) // only 1 for action choice
            const max = action?.info.handItemTokenIdRangeMax
            const min = action?.info.handItemTokenIdRangeMin

            // get an array of numbers between min and max (inclusive)
            const requiredItems = Array.from(
                { length: max - min + 1 },
                (_, i) => i + min
            )

            if (requiredItems.some((x) => x > 0)) {
                for (const h of heroesToAssign.value) {
                    const userItemsResult = await getUserItemNFTs(h.address, [])
                    if (
                        !userItemsResult.userItemNFTs.some((x) =>
                            requiredItems.includes(x.tokenId)
                        )
                    ) {
                        missingItems.value.push(
                            `${h.playerState.name} is missing ${itemNames[min]}`
                        )
                    }
                    // find first item in the requiredItems array that the user has
                    rightHandItems.value.push(
                        userItemsResult.userItemNFTs.find((x) =>
                            requiredItems.includes(x.tokenId)
                        )?.tokenId || 0
                    )
                }
            }
        }
    } catch {
    } finally {
        loading.value = false
        checking.value = false
    }
}

const assignHeroes = async () => {
    loading.value = true
    try {
        if (
            skillId.value > 0 &&
            skillStore.getActionInputsForSkill(skillId.value).length > 0
        ) {
            await factoryStore.assignActionToProxy(
                heroesToAssign.value,
                actionId.value,
                0,
                rightHandItems.value,
                queueStatus.value,
                active.value
            )
        } else if (
            skillId.value > 0 &&
            skillStore.getActionChoiceInputsForSkill(skillId.value).length > 0
        ) {
            await factoryStore.assignActionToProxy(
                heroesToAssign.value,
                allActions.find((x) => x.info.skill == skillId.value)
                    ?.actionId || 0,
                actionChoiceOutputId.value,
                rightHandItems.value,
                queueStatus.value,
                active.value
            )
        }

        app.addToast(
            `${heroesToAssign.value.length} hero${
                heroesToAssign.value.length !== 1 ? "es" : ""
            } assigned`,
            "alert-success",
            5000
        )
        skillId.value = Skill.NONE
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
