<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/repair/list/index.vue -->
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
            ><el-option label="待处理" :value="0" /><el-option
              label="处理中"
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
        <el-table-column prop="id" label="工单号" width="80" align="center" />
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
        <el-table-column prop="createdAt" label="提交时间" width="180"
          ><template #default="{ row }">{{
            row.createdAt
              ? new Date(row.createdAt).toLocaleString("zh-CN")
              : "-"
          }}</template></el-table-column
        >
        <el-table-column label="操作" width="120" align="center"
          ><template #default="{ row }"
            ><el-button
              link
              type="primary"
              @click="handleProcess(row)"
              v-if="row.status < 2"
              >处理</el-button
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
    <el-dialog v-model="processVisible" title="工单处理" width="500px">
      <el-form label-width="80px">
        <el-form-item label="状态"
          ><el-radio-group v-model="processForm.status"
            ><el-radio :label="1">处理中</el-radio
            ><el-radio :label="2">已完成</el-radio></el-radio-group
          ></el-form-item
        >
        <el-form-item label="备注"
          ><el-input v-model="processForm.handleNote" type="textarea" rows="3"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="processVisible = false">取消</el-button
        ><el-button type="primary" @click="submitProcess"
          >确定</el-button
        ></template
      >
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { listRepair, handleRepair } from "@/api/repair";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const processVisible = ref(false);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: "",
  status: undefined as number | undefined,
});
const processForm = reactive({ id: 0, status: 1, handleNote: "" });
const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: "待处理", type: "warning" },
  1: { label: "处理中", type: "primary" },
  2: { label: "已完成", type: "success" },
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listRepair(queryParams);
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
function handleProcess(row: any) {
  processForm.id = row.id;
  processForm.status = 1;
  processForm.handleNote = "";
  processVisible.value = true;
}
async function submitProcess() {
  await handleRepair(processForm);
  ElMessage.success("处理成功");
  processVisible.value = false;
  getList();
}
</script>
