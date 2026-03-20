<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/system/menu/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
      >
        <el-table-column prop="name" label="菜单名称" width="200" />
        <el-table-column label="图标" width="80" align="center"
          ><template #default="{ row }"
            ><el-icon v-if="row.icon"
              ><component :is="row.icon" /></el-icon></template
        ></el-table-column>
        <el-table-column
          prop="orderNum"
          label="排序"
          width="80"
          align="center"
        />
        <el-table-column prop="perms" label="权限标识" width="150" />
        <el-table-column prop="component" label="组件路径" width="200" />
        <el-table-column label="状态" width="80" align="center"
          ><template #default="{ row }"
            ><el-tag :type="row.status === 1 ? 'success' : 'info'">{{
              row.status === 1 ? "正常" : "停用"
            }}</el-tag></template
          ></el-table-column
        >
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { listMenu } from "@/api/menu";

const loading = ref(false);
const menuList = ref<any[]>([]);

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listMenu();
    menuList.value = buildTree(res.data, 0);
  } finally {
    loading.value = false;
  }
}
function buildTree(list: any[], parentId: number): any[] {
  return list
    .filter((i) => i.parentId === parentId)
    .map((i) => ({ ...i, children: buildTree(list, i.id) }));
}
</script>
