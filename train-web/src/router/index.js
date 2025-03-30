import {createRouter, createWebHistory} from 'vue-router'
import {notification} from "ant-design-vue";
import store from "@/store";
import NotFoundComponent from "@/components/NotFoundComponent.vue";

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue')
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
                path: 'passenger',
                component: () => import('../views/main/PassengerView.vue')
            },
            {
                path: 'ticket',
                component: () => import('../views/main/TicketView.vue')
            },
            {
                path: 'order',
                component: () => import('../views/main/OrderView.vue')
            },
        ]
    },
    {
        // 首页重定向到欢迎页
        path: '/',
        redirect: '/welcome'
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

// 路由登录拦截
router.beforeEach((to, from, next) => {
    // 判断是否需要对meta.loginRequire属性做监控拦截
    if (to.matched.some(function (item) {
        console.log(item, "需要登录校验：", item.meta.loginRequire || false);
        return item.meta.loginRequire
    })) {
        const member = store.state.member;
        console.log("页面登录校验开始：", member);
        if (!member.token) {
            console.log("用户未登录或登录超时！");
            notification.error({description: "未登录或登录超时"});
            next('/login');
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router
