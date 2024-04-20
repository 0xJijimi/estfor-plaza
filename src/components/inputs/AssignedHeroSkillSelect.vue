<template>
    <label class="form-control">
        <div v-if="$props.label" class="label">
            <span class="label-text">{{ props.label }}</span>
        </div>
        <select
            class="select select-bordered"
            :class="customClass"
            v-model="value"
        >
            <option v-for="o in options" :key="o" :value="o">
                {{ o === Skill.NONE ? '' : skillNames[o] || '' }}
            </option>
        </select>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { decode } from "../../utils/abi"
import estforPlayerAbi from "../../abi/estforPlayer.json"
import { ProxySilo } from "../../store/models/factory.models";
import { allActions } from "../../data/actions";
import { Skill } from "@paintswap/estfor-definitions/types";
import { skillNames } from "../../store/skills";

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    modelValue: {
        type: Number,
        default: Skill.NONE,
    },
    heroes: {
        type: Array as () => ProxySilo[],
        required: true,
    },
    customClass: {
        type: String,
        default: "select-sm",
    },
    label: {
        type: String,
        default: "",
    },
})

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit("update:modelValue", value)
    },
})

const options = computed(() => {
    return [
        Skill.NONE,
        ...props.heroes.map((h) => {
            const decoded = decode(
                h.savedTransactions[0].data,
                "startActions",
                estforPlayerAbi
            )
            const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
            const action = allActions.find(
                (a) => a.actionId === Number(actionId)
            )
            return action?.info.skill || Skill.NONE
        }),
        ...props.heroes
            .map((h) => {
                return h.queuedActions.map(
                    (q) =>
                        q.skill
                )
            })
            .flat(),
    ].filter((value, index, self) => {
        return self.findIndex((v) => v === value) === index
    })
})
</script>
