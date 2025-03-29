<template>
  <a-layout-sider width="200" style="background: #fff">
    <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        :style="{ height: '100%', borderRight: 0 }"
    >

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

      <a-sub-menu key="train">
        <template #title>
              <span>
                基础数据管理
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

      <a-sub-menu key="business">
        <template #title>
              <span>
                业务数据管理
              </span>
        </template>
        <a-menu-item key="/business/daily-train-ticket">
          <router-link to="/business/daily-train-ticket">每日火车余票管理</router-link>
        </a-menu-item>
        <a-menu-item key="/business/daily-train">
          <router-link to="/business/daily-train">每日车次管理</router-link>
        </a-menu-item>
        <a-menu-item key="/business/daily-train-station">
          <router-link to="/business/daily-train-station">每日火车车站管理</router-link>
        </a-menu-item>
        <a-menu-item key="/business/daily-train-carriage">
          <router-link to="/business/daily-train-carriage">每日火车车厢管理</router-link>
        </a-menu-item>
        <a-menu-item key="/business/daily-train-seat">
          <router-link to="/business/daily-train-seat">每日火车座位管理</router-link>
        </a-menu-item>
      </a-sub-menu>

    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import {ref} from "vue";

const selectedKeys = ref([]);
const openKeys = ref(["batch", "train", "business"]);
</script>

<style scoped>

</style>