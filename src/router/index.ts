import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import { useBroochStore } from "../store/brooch"
import Base from "../components/Base.vue"
import { useAppStore } from "../store/app"

declare module "vue-router" {
    interface RouteMeta {
        showItemSearch?: boolean
        requiresEmeraldBrooch?: boolean
        requiresRubyBrooch?: boolean
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
                path: "skills",
                component: () => import("../components/SkillTraining.vue"),
                meta: {
                    showItemSearch: true,
                },
            },
            {
                path: "hero-select",
                component: () => import("../components/HeroSelect.vue"),
            },
            {
                path: "lotteries",
                component: () => import("../components/LotteryRanking.vue"),
            },
            {
                path: "clan-battle",
                component: () => import("../components/ClanBattle.vue"),
                meta: {
                    requiresEmeraldBrooch: true,
                },
            },
            {
                path: "territory-rankings",
                component: () =>
                    import("../components/TerritoryBattleRankings.vue"),
                meta: {
                    requiresEmeraldBrooch: true,
                },
            },
            {
                path: "vault-rankings",
                component: () =>
                    import("../components/VaultBattleRankings.vue"),
                meta: {
                    requiresEmeraldBrooch: true,
                },
            },
            {
                path: "clan-management",
                component: () => import("../components/ClanManagement.vue"),
                redirect: "/clan-management/wishing-well",
                children: [
                    {
                        path: "wishing-well",
                        component: () =>
                            import(
                                "../components/clan-management/WishContributions.vue"
                            ),
                        meta: {
                            requiresEmeraldBrooch: true,
                        },
                        props: true,
                    },
                ],
            },
            {
                path: "factory",
                component: () => import("../components/Factory.vue"),
                meta: {
                    requiresRubyBrooch: true,
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
        if (broochStore.brooch(0).baseTokenPrice === 0) {
            await broochStore.getBroochData(0, false)
        }
        if (broochStore.brooch(1).baseTokenPrice === 0) {
            await broochStore.getBroochData(1, true)
        }
        if (
            broochStore.brooch(0).balance === 0 &&
            broochStore.brooch(1).balance === 0
        ) {
            return router.push("/")
        }
    }
    if (to.meta.requiresRubyBrooch) {
        const broochStore = useBroochStore()
        if (broochStore.brooch(1).baseTokenPrice === 0) {
            await broochStore.getBroochData(1, true)
        }
        if (broochStore.brooch(1).balance === 0) {
            return router.push("/")
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
