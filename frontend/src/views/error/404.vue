<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/error/404.vue -->
<template>
  <div class="error-page">
    <div class="error-content">
      <el-icon :size="120" color="#909399"><QuestionFilled /></el-icon>
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue";
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}
.error-content {
  text-align: center;
}
.error-content h1 {
  font-size: 72px;
  color: #909399;
  margin: 20px 0 10px;
}
.error-content p {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}
</style>
