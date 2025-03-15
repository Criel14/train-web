<template>
  <a-layout-header class="header">
    <div class="logo"/>
    <div class="member-info" v-if="member && Object.keys(member).length">
      您好：{{ member.mobile }} &nbsp;&nbsp;
      <router-link to="/login" style="color: #dff3ff" @click="logout">
        退出登录
      </router-link>
    </div>
    <div class="member-info" v-else>
      未登录&nbsp;&nbsp;
      请先 <router-link to="/login" style="color: #dff3ff">登录</router-link>
    </div>
    <a-menu
        v-model:selectedKeys="selectedKeys1"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
    >
      <a-menu-item key="1">nav 1</a-menu-item>
      <a-menu-item key="2">nav 2</a-menu-item>
      <a-menu-item key="3">nav 3</a-menu-item>
    </a-menu>
  </a-layout-header>
</template>

<script setup>
import {ref} from "vue";
import store from "@/store";

const selectedKeys1 = ref(['2']);
let member = store.state.member;

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
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
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