<template>
  <el-menu
      class="el-menu-vertical-demo h-full"
      default-active="1">
    <h3 class="my-6 mx-4">
      SEO Toolkit
    </h3>
    <el-menu-item v-for="(item, index) in navItems" :key="index" :index="(index+1).toString()"
                  @click="()=>pushRoute(item.link)">
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
import {useRouter} from "@nuxtjs/composition-api";

const router = useRouter()
const pushRoute = (link: string) => {
  router.push(link)
}
</script>