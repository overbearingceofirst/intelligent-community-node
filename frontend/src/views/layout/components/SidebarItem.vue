<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/layout/components/SidebarItem.vue -->
<template>
  <template v-if="!item.meta?.hidden">
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren)
      "
    >
      <el-menu-item
        v-if="onlyOneChild.meta"
        :index="resolvePath(onlyOneChild.path)"
      >
        <el-icon v-if="onlyOneChild.meta.icon"
          ><component :is="onlyOneChild.meta.icon"
        /></el-icon>
        <template #title>{{ onlyOneChild.meta.title }}</template>
      </el-menu-item>
    </template>
    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon"
          ><component :is="item.meta.icon"
        /></el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/store/user";

const props = withDefaults(
  defineProps<{ item: RouteRecordRaw; basePath?: string }>(),
  { basePath: "" },
);
const userStore = useUserStore();
const onlyOneChild = ref<RouteRecordRaw>({} as RouteRecordRaw);

function hasOneShowingChild(
  children: RouteRecordRaw[] = [],
  parent: RouteRecordRaw,
): boolean {
  const showingChildren = children.filter((item) => {
    if (item.meta?.hidden) return false;
    const roles = item.meta?.roles as string[] | undefined;
    if (roles && !roles.some((r) => userStore.roles.includes(r))) return false;
    onlyOneChild.value = item;
    return true;
  });
  if (showingChildren.length === 1) return true;
  if (showingChildren.length === 0) {
    onlyOneChild.value = {
      ...parent,
      path: "",
      noShowingChildren: true,
    } as any;
    return true;
  }
  return false;
}

function resolvePath(routePath: string): string {
  if (routePath.startsWith("/")) return routePath;
  if (props.basePath.startsWith("/")) {
    return props.basePath.endsWith("/")
      ? `${props.basePath}${routePath}`
      : `${props.basePath}/${routePath}`;
  }
  return `/${props.basePath}/${routePath}`.replace(/\/+/g, "/");
}
</script>

<style scoped>
:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}
:deep(.el-sub-menu .el-menu) {
  background-color: #000c17 !important;
}
</style>
