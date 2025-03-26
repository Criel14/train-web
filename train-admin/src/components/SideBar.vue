<template>
  <a-layout-sider width="200" style="background: #fff">
    <a-menu
        v-model:selectedKeys="selectedKeys2"
        v-model:openKeys="openKeys"
        mode="inline"
        :style="{ height: '100%', borderRight: 0 }"
    >
      <a-sub-menu key="train">
        <template #title>
              <span>
                火车管理
              </span>
        </template>
        <a-menu-item key="/train/station">
          <router-link to="/train/station">车站管理</router-link>
        </a-menu-item>
        <a-menu-item key="/train/train">
          <router-link to="/train/train">车次管理</router-link>
        </a-menu-item>
        <a-menu-item key="/train/train-station">
          <router-link to="/train/train-station">火车车站管理</router-link>
        </a-menu-item>
        <a-menu-item key="/train/train-carriage">
          <router-link to="/train/train-carriage">火车车厢管理</router-link>
        </a-menu-item>
        <a-menu-item key="/train/train-seat">
          <router-link to="/train/train-seat">火车座位管理</router-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="batch">
        <template #title>
              <span>
                定时任务管理
              </span>
        </template>
        <a-menu-item key="/batch/job">
          <router-link to="/batch/job">定时任务管理</router-link>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import {ref} from "vue";

const selectedKeys2 = ref(['1']);
const openKeys = ref(['sub1']);
</script>

<style scoped>

</style>