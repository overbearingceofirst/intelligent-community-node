<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/idle/list/index.vue -->
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
              label="上架"
              :value="1" /><el-option label="下架" :value="2" /></el-select
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
        <el-table-column prop="price" label="价格" width="100" align="right"
          ><template #default="{ row }"
            >¥{{ row.price }}</template
          ></el-table-column
        >
        <el-table-column prop="contact" label="联系方式" width="130" />
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="statusMap[row.status]?.type">{{
              statusMap[row.status]?.label
            }}</el-tag></template
          ></el-table-column
        >
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
              type="warning"
              @click="handleStatus(row, 2)"
              v-if="row.status === 1"
              >下架</el-button
            ><el-button
              link
              type="success"
              @click="handleStatus(row, 1)"
              v-if="row.status === 2"
              >上架</el-button
            ><el-button link type="danger" @click="handleDelete(row)"
              >删除</el-button
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
import { listIdle, auditIdle, changeIdleStatus, delIdle } from "@/api/idle";

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
  1: { label: "上架", type: "success" },
  2: { label: "下架", type: "info" },
  4: { label: "已驳回", type: "danger" },
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listIdle(queryParams);
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
  await auditIdle({ id: row.id, status });
  ElMessage.success("操作成功");
  getList();
}
async function handleStatus(row: any, status: number) {
  await changeIdleStatus({ id: row.id, status });
  ElMessage.success("操作成功");
  getList();
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？");
  await delIdle(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
