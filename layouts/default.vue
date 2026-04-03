<template>
  <el-container class="overflow-hidden h-[100vh] bg-bg">
    <el-aside width="250px">
      <CommonNavMenu />
    </el-aside>
    <el-container>
      <el-header class="flex items-center gap-2 text-primary">
        <i :class="`${activeItem.icon} text-xl`"></i>
        <h3>{{ activeItem.name }}</h3>
      </el-header>

      <el-main>
        <Nuxt />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { navItems } from '@/constants/routes';
import { computed, useRoute } from '@nuxtjs/composition-api';

const route = useRoute();
const activeItem = computed(() => navItems.find((item) => item.link === route.value.path) || navItems[0]);
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
