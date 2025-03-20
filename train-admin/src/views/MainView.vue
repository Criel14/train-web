<template>
  <a-layout>
    <HeaderBar/>
    <a-layout>
      <SideBar/>
      <a-layout style="padding: 16px">
        <!--根据子路由决定渲染哪个view-->
        <router-view/>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup>
import HeaderBar from "@/components/HeaderBar.vue";
import SideBar from "@/components/SideBar.vue";

</script>

<style scoped>
</style>