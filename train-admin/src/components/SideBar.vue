<template>
  <a-layout-sider width="200" style="background: #fff">
    <a-menu
        v-model:selectedKeys="selectedKeys2"
        v-model:openKeys="openKeys"
        mode="inline"
        :style="{ height: '100%', borderRight: 0 }"
    >
      <a-sub-menu key="sub1">
        <template #title>
              <span>
                <user-outlined/>
                主菜单
              </span>
        </template>
        <a-menu-item key="/station">
          <router-link to="/station">车站管理</router-link>
        </a-menu-item>
        <a-menu-item key="/train">
          <router-link to="/train">车次管理</router-link>
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