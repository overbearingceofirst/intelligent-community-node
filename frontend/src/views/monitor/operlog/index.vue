<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/monitor/operlog/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column
          prop="id"
          label="日志编号"
          width="100"
          align="center"
        />
        <el-table-column prop="title" label="系统模块" width="120" />
        <el-table-column prop="operName" label="操作人员" width="120" />
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
import request from "@/utils/request";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ pageNum: 1, pageSize: 10 });

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
</script>
