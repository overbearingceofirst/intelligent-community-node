<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/points/flow/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="居民ID"
          ><el-input
            v-model="queryParams.residentId"
            placeholder="请输入"
            clearable
            @keyup.enter="handleQuery"
        /></el-form-item>
        <el-form-item label="类型"
          ><el-select
            v-model="queryParams.type"
            placeholder="全部"
            clearable
            style="width: 120px"
            ><el-option label="获得" :value="1" /><el-option
              label="消费"
              :value="2" /></el-select
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
          prop="residentId"
          label="居民ID"
          width="100"
          align="center"
        />
        <el-table-column label="类型" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="row.type === 1 ? 'success' : 'warning'">{{
              row.type === 1 ? "获得" : "消费"
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column label="积分" width="100" align="center"
          ><template #default="{ row }"
            ><span :style="{ color: row.type === 1 ? '#67c23a' : '#f56c6c' }"
              >{{ row.type === 1 ? "+" : "-" }}{{ Math.abs(row.points) }}</span
            ></template
          ></el-table-column
        >
        <el-table-column
          prop="balance"
          label="余额"
          width="100"
          align="center"
        />
        <el-table-column
          prop="remark"
          label="备注"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="createdAt" label="时间" width="180"
          ><template #default="{ row }">{{
            row.createdAt
              ? new Date(row.createdAt).toLocaleString("zh-CN")
              : "-"
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
import { listPointsFlow } from "@/api/points";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  residentId: "",
  type: undefined as number | undefined,
});

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listPointsFlow(queryParams);
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
  Object.assign(queryParams, { pageNum: 1, residentId: "", type: undefined });
  getList();
}
</script>
