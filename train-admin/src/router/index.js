import {createRouter, createWebHistory} from 'vue-router'
import NotFoundComponent from "@/components/NotFoundComponent.vue";

const routes = [
    {
        // 首页重定向到欢迎页
        path: '/',
        redirect: '/welcome'
    },
    {
        path: '/',
        name: 'main',
        component: () => import('../views/MainView.vue'),
        meta: {
            loginRequire: true
        },
        children: [
            {
                path: 'welcome',
                component: () => import('../views/main/WelcomeView.vue')
            },
            {
                path: 'batch/',
                children: [
                    {
                        path: 'job',
                        component: () => import('../views/main/train/JobView.vue')
                    },
                ]
            },
            {
                path: 'train/',
                children: [
                    {
                        path: 'station',
                        component: () => import('../views/main/batch/StationView.vue')
                    },
                    {
                        path: 'train',
                        component: () => import('../views/main/batch/TrainView.vue')
                    },
                    {
                        path: 'train-station',
                        component: () => import('../views/main/batch/TrainStationView.vue')
                    },
                    {
                        path: 'train-carriage',
                        component: () => import('../views/main/batch/TrainCarriageView.vue')
                    },
                    {
                        path: 'train-seat',
                        component: () => import('../views/main/batch/TrainSeatView.vue')
                    },
                ]
            },
            {
                path: 'business/',
                children: [
                    {
                        path: 'daily-train',
                        component: () => import('../views/main/business/DailyTrain.vue')
                    },
                    {
                        path: 'daily-train-station',
                        component: () => import('../views/main/business/DailyTrainStation.vue')
                    },
                    {
                        path: 'daily-train-carriage',
                        component: () => import('../views/main/batch/TrainCarriageView.vue')
                    },
                    {
                        path: 'daily-train-seat',
                        component: () => import('../views/main/batch/TrainSeatView.vue')
                    },
                ]
            },
        ]
    },

    // 兜底路由：匹配所有未定义的路径
    // 进入自定义404页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundComponent,
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
