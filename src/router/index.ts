import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import { useBroochStore } from "../store/brooch"

declare module "vue-router" {
    interface RouteMeta {
        showItemSearch?: boolean
        requiresEmeraldBrooch?: boolean
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        component: () => import("../components/Base.vue"),
        children: [
            {
                path: "",
                redirect: "/combat",
            },
            {
                path: "combat",
                component: () => import("../components/CombatCalculator.vue"),
                meta: {
                    showItemSearch: true,
                },
            },
            {
                path: 'skills',
                component: () => import("../components/SkillTraining.vue"),
                meta: {
                    showItemSearch: true,
                },
            },
            {
                path: 'hero-select',
                component: () => import("../components/HeroSelect.vue"),
            },
            {
                path: 'lotteries',
                component: () => import("../components/LotteryRanking.vue"),
            },
            {
                path: 'clan-battle',
                component: () => import("../components/ClanBattle.vue"),
                meta: {
                    requiresEmeraldBrooch: true,
                },
            },
        ],
    },    
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(async (to) => {    
    if (to.meta.requiresEmeraldBrooch) {
        const broochStore = useBroochStore()
        if (broochStore.initialised === false) {
            await broochStore.getBroochData(0)
        }
        if (broochStore.brooch(0).balance === 0) {
            return false
        }
    }
})

export default router
