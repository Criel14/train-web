<template>
  <a-layout>
    <HeaderBar/>
    <a-layout>
      <SideBar/>
      <a-layout style="padding: 0 24px 24px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item>Home</a-breadcrumb-item>
          <a-breadcrumb-item>List</a-breadcrumb-item>
          <a-breadcrumb-item>App</a-breadcrumb-item>
        </a-breadcrumb>
        <a-layout-content
            :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
        >
          Content

          // 测试按钮
          <a-button type="primary" @click="test">Test Button</a-button>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup>
import HeaderBar from "@/components/HeaderBar.vue";
import SideBar from "@/components/SideBar.vue";
import axios from "axios";
import {notification} from "ant-design-vue";

// 测试
const test = () => {
  axios.get("/member/member/count").then((response) => {
    let data = response.data;
    if (data.success) {
      notification.success({description: "测试成功"});
    }
  })
};
</script>

<style scoped>
</style>