<template>
  <div class="title-container">
    <h1 class="title">欢迎使用：智程票务</h1>
  </div>
</template>

<script setup>
</script>

<style scoped>
.title-container {
  width: 100%;
  height: 84vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: #42a1ff;
  animation: fadeIn 1s ease-in-out;
}

/* 响应式设计：小屏幕下调整字体大小 */
@media (max-width: 600px) {
  .title {
    font-size: 32px;
  }
}
</style>
