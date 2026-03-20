<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/layout/index.vue -->
<template>
  <el-container class="layout-container">
    <el-aside
      :width="sidebarWidth"
      class="sidebar-container"
      :class="{ 'is-collapse': isCollapse }"
    >
      <div class="logo-container">
        <router-link to="/" class="logo-link">
          <el-icon :size="28" color="#409eff"><HomeFilled /></el-icon>
          <span v-show="!isCollapse" class="logo-title">智慧社区</span>
        </router-link>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          :collapse-transition="false"
          background-color="#001529"
          text-color="rgba(255,255,255,0.65)"
          active-text-color="#fff"
          router
        >
          <sidebar-item
            v-for="route in menuRoutes"
            :key="route.path"
            :item="route"
            :base-path="route.path"
          />
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header-container">
        <div class="header-left">
          <div class="hamburger" @click="toggleSidebar">
            <el-icon :size="20"
              ><Fold v-if="!isCollapse" /><Expand v-else
            /></el-icon>
          </div>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              <span v-if="item.redirect === 'noRedirect' || !item.path">{{
                item.meta?.title
              }}</span>
              <router-link v-else :to="item.path">{{
                item.meta?.title
              }}</router-link>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown
            class="user-dropdown"
            trigger="click"
            @command="handleCommand"
          >
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ userStore.name || "Admin" }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";
import { asyncRoutes } from "@/router";
import { ElMessageBox } from "element-plus";
import { Fold, Expand, ArrowDown, HomeFilled } from "@element-plus/icons-vue";
import SidebarItem from "./components/SidebarItem.vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const isCollapse = computed(() => !appStore.sidebar.opened);
const sidebarWidth = computed(() => (isCollapse.value ? "64px" : "210px"));

const menuRoutes = computed(() => {
  return asyncRoutes.filter((r) => {
    if (r.meta?.hidden) return false;
    const roles = r.meta?.roles as string[] | undefined;
    if (roles && !roles.some((role) => userStore.roles.includes(role)))
      return false;
    return true;
  });
});

const activeMenu = computed(() => route.path);

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title);
  if (matched.length && matched[0]?.path !== "/dashboard") {
    matched.unshift({ path: "/dashboard", meta: { title: "首页" } } as any);
  }
  return matched;
});

function toggleSidebar() {
  appStore.toggleSidebar();
}

function handleCommand(command: string) {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      type: "warning",
    }).then(async () => {
      await userStore.logout();
      router.push("/login");
    });
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-container {
  height: 100%;
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}
.sidebar-container.is-collapse {
  width: 64px;
}

.logo-container {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #001529;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.logo-title {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.header-container {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.header-left {
  display: flex;
  align-items: center;
}
.hamburger {
  cursor: pointer;
  padding: 0 12px;
  display: flex;
  align-items: center;
}
.hamburger:hover {
  background: rgba(0, 0, 0, 0.04);
}
.breadcrumb {
  margin-left: 8px;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-dropdown {
  cursor: pointer;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}
.username {
  font-size: 14px;
  color: #333;
}

.app-main {
  flex: 1;
  padding: 16px;
  background: #f0f2f5;
  overflow-y: auto;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.2s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
