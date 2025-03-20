<template>
  <a-layout-header class="header">
    <router-link to="/welcome">
      <div class="logo">
        智程票务
      </div>
    </router-link>
    <div class="member-info" v-if="member && Object.keys(member).length">
      您好：{{ member.mobile }} &nbsp;&nbsp;
      <router-link to="/login" style="color: #dff3ff" @click="logout">
        退出登录
      </router-link>
    </div>
    <div class="member-info" v-else>
      未登录&nbsp;&nbsp;
      请先
      <router-link to="/login" style="color: #dff3ff">登录</router-link>
    </div>
    <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
    >
      <a-menu-item key="/welcome">
        <router-link to="/welcome">首页</router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-header>
</template>

<script setup>
import {ref, watch} from "vue";
import store from "@/store";
import router from "@/router";

const selectedKeys = ref([]);
let member = store.state.member;

// 监听当前路由，修改选项的选中状态样式
// （约定选中的key的值和路径的值相同）
watch(
    () => router.currentRoute.value.path,
    (newPath) => {
      selectedKeys.value = [newPath];
    }
)

const logout = () => {
  store.commit("setMember", {});
  console.log("退出登录");
}

</script>

<style scoped>
.logo {
  float: left;
  width: 120px;
  height: 31px;
  line-height: 31px;
  font-weight: bold;
  font-size: 20px;
  margin: 16px 24px 16px 0;
  color: white;
}

.ant-row-rtl .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.member-info {
  float: right;
  color: white;
}
</style>