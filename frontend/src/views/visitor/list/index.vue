<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/visitor/list/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="访客姓名"
          ><el-input
            v-model="queryParams.visitorName"
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
            ><el-option label="待核验" :value="0" /><el-option
              label="已核验"
              :value="1" /></el-select
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
        <el-table-column prop="visitorName" label="访客姓名" width="120" />
        <el-table-column prop="visitorPhone" label="访客电话" width="130" />
        <el-table-column
          prop="residentId"
          label="邀请居民ID"
          width="120"
          align="center"
        />
        <el-table-column prop="visitTime" label="预约时间" width="180"
          ><template #default="{ row }">{{
            row.visitTime
              ? new Date(row.visitTime).toLocaleString("zh-CN")
              : "-"
          }}</template></el-table-column
        >
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="row.status === 0 ? 'warning' : 'success'">{{
              row.status === 0 ? "待核验" : "已核验"
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column label="操作" width="100" align="center"
          ><template #default="{ row }"
            ><el-button
              link
              type="primary"
              @click="handleVerify(row)"
              v-if="row.status === 0"
              >核验</el-button
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
import { ElMessage } from "element-plus";
import { listVisitor, verifyVisitor } from "@/api/visitor";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  visitorName: "",
  status: undefined as number | undefined,
});

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listVisitor(queryParams);
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
  Object.assign(queryParams, {
    pageNum: 1,
    visitorName: "",
    status: undefined,
  });
  getList();
}
async function handleVerify(row: any) {
  await verifyVisitor({ id: row.id });
  ElMessage.success("核验成功");
  getList();
}
</script>
