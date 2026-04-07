<script lang="ts" setup></script>

<template>
  <div class="el-skeleton is-animated bg-white p-4 flex flex-col gap-4 h-full">
    <el-skeleton-item style="width: 40%; align-self: center" variant="h3" />
    <el-skeleton-item style="width: 100%; flex: 1" variant="rect" />
    <div class="grid grid-flow-col auto-cols-fr gap-6 mb-3 ml-8">
      <el-skeleton-item v-for="i in 10" :key="'header-' + i" variant="text" />
    </div>
  </div>
</template>

<style scoped></style>
