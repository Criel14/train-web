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
    // 捕获错误并显示通知
    notification.error({
        message: '网络请求错误，请稍后再试',
        description: error.message, // 可选
        duration: 3, // 持续时间，可根据需要调整
    });
    return Promise.reject(error);
});

axios.defaults.baseURL = process.env.VUE_APP_SERVER;

console.log('环境：', process.env.NODE_ENV);
console.log('服务端：', process.env.VUE_APP_SERVER);