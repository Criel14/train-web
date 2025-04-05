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
                        component: () => import('../views/main/batch/JobView.vue')
                    },
                ]
            },
            {
                path: 'train/',
                children: [
                    {
                        path: 'station',
                        component: () => import('../views/main/train/StationView.vue')
                    },
                    {
                        path: 'train',
                        component: () => import('../views/main/train/TrainView.vue')
                    },
                    {
                        path: 'train-station',
                        component: () => import('../views/main/train/TrainStationView.vue')
                    },
                    {
                        path: 'train-carriage',
                        component: () => import('../views/main/train/TrainCarriageView.vue')
                    },
                    {
                        path: 'train-seat',
                        component: () => import('../views/main/train/TrainSeatView.vue')
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
                        component: () => import('../views/main/business/DailyTrainCarriage.vue')
                    },
                    {
                        path: 'daily-train-seat',
                        component: () => import('../views/main/business/DailyTrainSeat.vue')
                    },
                    {
                        path: 'daily-train-ticket',
                        component: () => import('../views/main/business/DailyTrainTicket.vue')
                    },
                    {
                        path: 'confirm-order',
                        component: () => import('../views/main/business/ConfirmOrder.vue')
                    },
                    {
                        path: 'sk-token',
                        component: () => import('../views/main/business/SkTokenView.vue')
                    },
                ]
            },
            {
                path: 'member/',
                children: [
                    {
                        path: 'ticket',
                        component: () => import('../views/main/member/TicketView.vue')
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
