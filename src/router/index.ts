import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

declare module "vue-router" {
    interface RouteMeta {
        requiresMint?: boolean
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        component: () => import("../components/Base.vue"),
    },    
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router
