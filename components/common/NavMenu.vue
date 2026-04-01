<template>
  <el-menu
      :default-active="currentPath"
      class="el-menu-vertical-demo h-full"
      router>
    <h3 class="my-6 mx-4">
      SEO Toolkit
    </h3>
    <el-menu-item v-for="item in navItems" :key="item.link" :index="item.link">
      <i :class="item.icon"></i>
      <span slot="title">{{ item.name }}</span>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
h3 {
  font-size: 20px;
  font-weight: 500;
  padding-left: 20px;
}
</style>
<script lang="ts" setup>
import {navItems} from '@/constants/routes';
import {computed, useRoute} from "@nuxtjs/composition-api";

const route = useRoute()
const currentPath = computed(() => route.value.path)
</script>