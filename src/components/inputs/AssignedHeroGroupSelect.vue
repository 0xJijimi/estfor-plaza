<template>
    <label class="form-control">
        <select class="select select-bordered select-sm" v-model="value">
            <option v-for="o in options" :key="o" :value="o">
                {{ o }}
            </option>
        </select>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { actionChoiceNames, actionNames } from "../../store/skills"
import { ProxySilo } from "../../store/factory"
import { decode } from "../../utils/abi";
import estforPlayerAbi from "../../abi/estforPlayer.json"

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    modelValue: {
        type: String,
        default: undefined,
    },
    heroes: {
        type: Array as () => ProxySilo[],
        required: true,
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
    return ["", ...props.heroes.map((h) => {
        const decoded = decode(h.savedTransactions[0].data, "startActions", estforPlayerAbi)
        const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
        const choiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
        return (
            actionNames[Number(actionId)] ||
            actionChoiceNames[Number(choiceId)] ||
            "Unknown"
        )
    }).filter((value, index, self) => {
                    return (
                        self.findIndex((v) => v === value) === index
                    )
                })]
})
</script>
