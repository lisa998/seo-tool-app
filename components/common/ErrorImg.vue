<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: '伺服器忙碌中，請稍後再試',
  },
});
</script>

<template>
  <div class="flex justify-center items-center text-primary h-full w-full bg-white rounded-lg">
    <img alt="" class="h-[70px]" src="~/assets/images/error_img.png" />
    <p class="text-lg">{{ props.text }}</p>
  </div>
</template>

<style scoped></style>
