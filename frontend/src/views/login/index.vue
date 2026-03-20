<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/login/index.vue -->
<template>
  <div class="login-wrapper">
    <div class="login-box">
      <div class="login-header">
        <h2>若依后台管理系统</h2>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="账号"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-row">
            <el-input
              v-model="loginForm.code"
              placeholder="验证码"
              size="large"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <div class="code-img" @click="refreshCaptcha">
              <span>{{ captchaText }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? "登录中..." : "登 录" }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="login-footer">
      Copyright © 2018-2024 ruoyi.vip All Rights Reserved.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock, Key } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";
import Cookies from "js-cookie";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loginFormRef = ref();
const loading = ref(false);
const captchaText = ref("");

const loginForm = reactive({
  username: "admin",
  password: "admin123",
  code: "",
  rememberMe: true,
});

const loginRules = {
  username: [{ required: true, message: "请输入您的账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入您的密码", trigger: "blur" }],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

function generateCaptcha() {
  const chars = "ABCDEFGHJKMNPQRSTWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  captchaText.value = code;
}

function refreshCaptcha() {
  generateCaptcha();
}

async function handleLogin() {
  if (!loginFormRef.value) return;

  loginFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    if (loginForm.code.toLowerCase() !== captchaText.value.toLowerCase()) {
      ElMessage.error("验证码错误");
      refreshCaptcha();
      return;
    }

    loading.value = true;

    try {
      if (loginForm.rememberMe) {
        Cookies.set("username", loginForm.username, { expires: 30 });
        Cookies.set("password", btoa(loginForm.password), { expires: 30 });
        Cookies.set("rememberMe", "true", { expires: 30 });
      } else {
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }

      await userStore.login({
        username: loginForm.username,
        password: loginForm.password,
      });
      ElMessage.success("登录成功");

      const redirect = (route.query.redirect as string) || "/";
      router.push(redirect);
    } catch (error: any) {
      refreshCaptcha();
    } finally {
      loading.value = false;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");

  if (username) loginForm.username = username;
  if (password) loginForm.password = atob(password);
  loginForm.rememberMe = rememberMe === "true";
}

onMounted(() => {
  getCookie();
  generateCaptcha();
});
</script>

<style>
/* 全局重置，确保登录页样式生效 */
.login-wrapper * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

<style scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-wrapper::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 60%
  );
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-box {
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 40px 35px 30px;
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1d3557;
  letter-spacing: 2px;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 0 15px;
  height: 48px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

.login-form :deep(.el-input__inner) {
  height: 48px;
  line-height: 48px;
  font-size: 15px;
}

.login-form :deep(.el-input__prefix) {
  font-size: 18px;
  color: #909399;
}

.code-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-row :deep(.el-input) {
  flex: 1;
}

.code-img {
  width: 120px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.code-img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.code-img span {
  font-size: 22px;
  font-weight: bold;
  font-style: italic;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  user-select: none;
}

.login-form :deep(.el-checkbox__label) {
  color: #606266;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 4px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #2b7de9 100%);
  border: none;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.login-footer {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  letter-spacing: 1px;
  z-index: 10;
}
</style>
