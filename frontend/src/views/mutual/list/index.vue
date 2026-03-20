<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/mutual/list/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="标题"
          ><el-input
            v-model="queryParams.title"
            placeholder="请输入"
            clearable
            @keyup.enter="handleQuery"
        /></el-form-item>
        <el-form-item label="状态"
          ><el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
            ><el-option label="待审核" :value="0" /><el-option
              label="进行中"
              :value="1" /><el-option label="已完成" :value="2" /></el-select
        ></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="handleQuery">搜索</el-button
          ><el-button @click="resetQuery">重置</el-button></el-form-item
        >
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="content"
          label="内容"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="statusMap[row.status]?.type">{{
              statusMap[row.status]?.label
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column prop="points" label="积分" width="80" align="center" />
        <el-table-column label="操作" width="200" align="center"
          ><template #default="{ row }"
            ><el-button
              link
              type="primary"
              @click="handleAudit(row, 1)"
              v-if="row.status === 0"
              >通过</el-button
            ><el-button
              link
              type="warning"
              @click="handleAudit(row, 4)"
              v-if="row.status === 0"
              >驳回</el-button
            ><el-button
              link
              type="success"
              @click="handleComplete(row)"
              v-if="row.status === 1"
              >完成确认</el-button
            ></template
          ></el-table-column
        >
      </el-table>
      <div style="margin-top: 16px; display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          layout="total,prev,pager,next"
          @change="getList"
        />
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listMutual, auditMutual, completeMutual } from "@/api/mutual";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: "",
  status: undefined as number | undefined,
});
const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: "待审核", type: "warning" },
  1: { label: "进行中", type: "primary" },
  2: { label: "已完成", type: "success" },
  4: { label: "已驳回", type: "danger" },
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listMutual(queryParams);
    tableData.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
function resetQuery() {
  Object.assign(queryParams, { pageNum: 1, title: "", status: undefined });
  getList();
}
async function handleAudit(row: any, status: number) {
  await auditMutual({ id: row.id, status });
  ElMessage.success("操作成功");
  getList();
}
async function handleComplete(row: any) {
  const { value } = await ElMessageBox.prompt("请输入奖励积分", "完成确认", {
    inputValue: "10",
  });
  await completeMutual({ id: row.id, points: Number(value) });
  ElMessage.success("确认完成");
  getList();
}
</script>
