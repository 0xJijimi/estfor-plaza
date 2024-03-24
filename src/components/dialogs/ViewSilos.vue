<template>
    <dialog id="view_silos_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">View Silos</h3>

            <div v-for="silo in allSilos" :key="silo.address" class="flex">
                <div class="w-[60px]">{{ silo.index }}</div>
                <div v-if="silo.allPlayers.length > 0">
                    <div
                        v-for="player in silo.allPlayers"
                        :key="player.tokenId"
                    >
                        {{ player.name }}
                        {{ player.isActive ? "(active)" : "" }}
                    </div>
                </div>
                <div v-else>No heroes</div>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useFactoryStore } from "../../store/factory"

const factoryStore = useFactoryStore()
const allSilos = computed(() => factoryStore.proxys)

const openDialog = () => {
    const dialog = document.getElementById(
        "view_silos_modal"
    ) as HTMLDialogElement
    dialog.showModal()
}
defineExpose({
    openDialog,
})
</script>
