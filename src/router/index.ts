import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import { useBroochStore } from "../store/brooch"
import Base from "../components/Base.vue"
import { useAppStore } from "../store/app"

declare module "vue-router" {
    interface RouteMeta {
        showItemSearch?: boolean
        requiresEmeraldBrooch?: boolean
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        component: Base,
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
    const appStore = useAppStore()
    appStore.loadingRoute = true
    
    if (to.meta.requiresEmeraldBrooch) {
        const broochStore = useBroochStore()
        if (broochStore.initialised === false) {
            await broochStore.getBroochData(0)
        }
        if (broochStore.brooch(0).balance === 0) {
            return router.push('/')
        }
    }
})

router.afterEach(() => {
    const appStore = useAppStore()
    appStore.loadingRoute = false
})

router.onError((error) => {
    console.error(error)
})

export default router
