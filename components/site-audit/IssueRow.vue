<template>
  <li class="inline-grid gap-2 grid-cols-[1fr_1fr_4fr_1fr]">
    <span>
      <el-tag size="mini">{{ categoryLabel }}</el-tag>
    </span>
    <span>
      <el-tag :type="severityType" size="mini">{{ severityLabel }}</el-tag>
    </span>
    <span class="text-text text-sm">{{ message }}</span>
    <span class="text-text-secondary text-sm">{{ affectedUrls }}</span>
  </li>
</template>

<script lang="ts" setup>
defineProps({
  categoryLabel: {
    type: String,
    required: true,
  },
  severityLabel: {
    type: String,
    required: true,
  },
  severityType: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  affectedUrls: {
    type: String,
    default: '',
  },
});
</script>
