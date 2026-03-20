<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/system/log/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="模块"
          ><el-input
            v-model="queryParams.title"
            placeholder="系统模块"
            clearable
        /></el-form-item>
        <el-form-item label="操作人"
          ><el-input
            v-model="queryParams.operName"
            placeholder="操作人员"
            clearable
        /></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="handleQuery">搜索</el-button
          ><el-button @click="resetQuery">重置</el-button></el-form-item
        >
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div style="margin-bottom: 16px">
        <el-button type="danger" @click="handleClean">清空</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column
          prop="id"
          label="日志编号"
          width="100"
          align="center"
        />
        <el-table-column prop="title" label="系统模块" width="120" />
        <el-table-column
          prop="requestMethod"
          label="请求方式"
          width="100"
          align="center"
        />
        <el-table-column prop="operName" label="操作人员" width="120" />
        <el-table-column prop="operIp" label="操作地址" width="130" />
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="row.status === 0 ? 'success' : 'danger'">{{
              row.status === 0 ? "成功" : "失败"
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column prop="operTime" label="操作时间" width="180"
          ><template #default="{ row }">{{
            row.operTime ? new Date(row.operTime).toLocaleString("zh-CN") : "-"
          }}</template></el-table-column
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
import request from "@/utils/request";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: "",
  operName: "",
});

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await request.get("/system/log/operlog/list", {
      params: queryParams,
    });
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
  Object.assign(queryParams, { pageNum: 1, title: "", operName: "" });
  getList();
}
async function handleClean() {
  await ElMessageBox.confirm("确认清空所有日志？");
  await request.delete("/system/log/operlog/clean");
  ElMessage.success("清空成功");
  getList();
}
</script>
