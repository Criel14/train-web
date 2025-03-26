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
        path: 'station',
        component: () => import('../views/main/StationView.vue')
      },
      {
        path: 'train',
        component: () => import('../views/main/TrainView.vue')
      },
      {
        path: 'train-station',
        component: () => import('../views/main/TrainStationView.vue')
      },
      {
        path: 'train-carriage',
        component: () => import('../views/main/TrainCarriageView.vue')
      },
      {
        path: 'train-seat',
        component: () => import('../views/main/TrainSeatView.vue')
      },
      {
        path: 'batch/job',
        component: () => import('../views/main/JobView.vue')
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
