import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd, {notification} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import * as Icons from '@ant-design/icons-vue';
import axios from 'axios';
import '../../train-admin/src/assets/js/enums';

const app = createApp(App);
app.use(Antd).use(store).use(router).mount('#app');

// 全局使用图标
const icons = Icons;
for (const i in icons) {
    app.component(i, icons[i]);
}

// axios拦截器：拦截发出去的请求
axios.interceptors.request.use(function (config) {
    console.log('请求参数：', config);
    const token = store.state.member.token;
    if (token) {
        config.headers.token = token;
        console.log("请求headers增加token:", token);
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// axios拦截器：拦截接收的响应结果
axios.interceptors.response.use(function (response) {
    console.log('返回结果：', response);
    return response;
}, error => {
    console.log('返回错误：', error);
    const response = error.response;
    if (response == null) {
        return Promise.reject(error);
    }
    const status = response.status;
    // 判断状态码是401 跳转到登录页
    if (status === 401) {
        console.log("未登录或登录超时，跳到登录页");
        // 会员信息置为空对象
        store.commit("setMember", {});
        notification.error({description: "未登录或登录超时"});
        // 延时跳转
        setTimeout(() => {
            router.push('/login');
        }, 1000)
        // 此处不再返回reject，直接返回一个空对象（或其他默认值）
        return Promise.resolve({data: {}});
    }
    return Promise.reject(error);
});

axios.defaults.baseURL = process.env.VUE_APP_SERVER;

console.log('环境：', process.env.NODE_ENV);
console.log('服务端：', process.env.VUE_APP_SERVER);