<template>
  <div class="square"></div>
</template>

<style scoped>
.square {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background-color: #a48677;
  animation: loading 1.5s cubic-bezier(0.17, 0.37, 0.43, 0.67) infinite;
}

@keyframes loading {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(70px, 0) rotate(360deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}
</style>
