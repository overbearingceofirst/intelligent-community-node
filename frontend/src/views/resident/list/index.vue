<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/resident/list/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="用户名"
          ><el-input
            v-model="queryParams.username"
            placeholder="请输入"
            clearable
            @keyup.enter="handleQuery"
        /></el-form-item>
        <el-form-item label="手机号"
          ><el-input v-model="queryParams.phone" placeholder="请输入" clearable
        /></el-form-item>
        <el-form-item label="状态"
          ><el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
            ><el-option label="启用" :value="1" /><el-option
              label="禁用"
              :value="0" /></el-select
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
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="认证状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="authMap[row.authStatus]?.type">{{
              authMap[row.authStatus]?.label
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column prop="points" label="积分" width="80" align="center" />
        <el-table-column label="账号状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)" /></template
        ></el-table-column>
        <el-table-column label="操作" width="200" align="center"
          ><template #default="{ row }"
            ><el-button
              link
              type="primary"
              @click="handleAuditAuth(row)"
              v-if="row.authStatus === 1"
              >认证审核</el-button
            ><el-button link type="primary" @click="handleResetPwd(row)"
              >重置密码</el-button
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
import {
  listResident,
  changeResidentStatus,
  resetResidentPwd,
  auditResidentAuth,
  delResident,
} from "@/api/resident";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: "",
  phone: "",
  status: undefined as number | undefined,
});
const authMap: Record<number, { label: string; type: string }> = {
  0: { label: "未认证", type: "info" },
  1: { label: "待审核", type: "warning" },
  2: { label: "已认证", type: "success" },
  3: { label: "已驳回", type: "danger" },
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listResident(queryParams);
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
    username: "",
    phone: "",
    status: undefined,
  });
  getList();
}
async function handleStatusChange(row: any) {
  try {
    await changeResidentStatus({ id: row.id, status: row.status });
    ElMessage.success("操作成功");
  } catch {
    row.status = row.status === 1 ? 0 : 1;
  }
}
async function handleAuditAuth(row: any) {
  const action = await ElMessageBox.confirm("审核操作", "认证审核", {
    distinguishCancelAndClose: true,
    confirmButtonText: "通过",
    cancelButtonText: "驳回",
  }).catch((e) => e);
  if (action === "confirm") {
    await auditResidentAuth({ id: row.id, authStatus: 2 });
    ElMessage.success("已通过");
  } else if (action === "cancel") {
    await auditResidentAuth({ id: row.id, authStatus: 3 });
    ElMessage.success("已驳回");
  }
  getList();
}
async function handleResetPwd(row: any) {
  const { value } = await ElMessageBox.prompt("请输入新密码", "重置密码", {
    inputType: "password",
  });
  await resetResidentPwd({ id: row.id, password: value });
  ElMessage.success("重置成功");
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？");
  await delResident(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
