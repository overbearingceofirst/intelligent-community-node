<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/system/admin/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="用户名"
          ><el-input
            v-model="queryParams.userName"
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
            ><el-option label="正常" :value="1" /><el-option
              label="停用"
              :value="0" /></el-select
        ></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="handleQuery">搜索</el-button
          ><el-button @click="resetQuery">重置</el-button></el-form-item
        >
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="角色" width="120" align="center"
          ><template #default="{ row }"
            ><el-tag :type="row.roleId === 1 ? 'danger' : 'primary'">{{
              row.roleId === 1 ? "系统管理员" : "物业管理员"
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column label="绑定小区" width="150"
          ><template #default="{ row }">{{
            getCommunityName(row.communityId)
          }}</template></el-table-column
        >
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              :disabled="row.username === 'admin'" /></template
        ></el-table-column>
        <el-table-column label="操作" width="200" align="center"
          ><template #default="{ row }"
            ><el-button link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            ><el-button link type="primary" @click="handleResetPwd(row)"
              >重置密码</el-button
            ><el-button
              link
              type="danger"
              @click="handleDelete(row)"
              :disabled="row.username === 'admin'"
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
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑' : '新增'"
      width="550px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="userName"
          ><el-input v-model="form.userName" :disabled="isEdit"
        /></el-form-item>
        <el-form-item label="昵称" prop="nickName"
          ><el-input v-model="form.nickName"
        /></el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit"
          ><el-input v-model="form.password" type="password" show-password
        /></el-form-item>
        <el-form-item label="手机号"
          ><el-input v-model="form.phonenumber"
        /></el-form-item>
        <el-form-item label="角色"
          ><el-select v-model="form.roleId" @change="handleRoleChange"
            ><el-option label="系统管理员" :value="1" /><el-option
              label="物业管理员"
              :value="2" /></el-select
        ></el-form-item>
        <el-form-item label="绑定小区" v-if="form.roleId === 2"
          ><el-select
            v-model="form.communityId"
            placeholder="请选择小区"
            clearable
            ><el-option
              v-for="item in communityOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id" /></el-select
        ></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="dialogVisible = false">取消</el-button
        ><el-button type="primary" @click="submitForm"
          >确定</el-button
        ></template
      >
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  listUser,
  addUser,
  updateUser,
  delUser,
  resetUserPwd,
  changeUserStatus,
} from "@/api/user";
import { getCommunityOptions } from "@/api/setting";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const communityOptions = ref<any[]>([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: "",
  status: undefined as number | undefined,
});
const form = reactive({
  userId: undefined as number | undefined,
  userName: "",
  nickName: "",
  password: "",
  phonenumber: "",
  roleId: 2,
  communityId: undefined as number | undefined,
});
const rules = {
  userName: [{ required: true, message: "请输入用户名" }],
  nickName: [{ required: true, message: "请输入昵称" }],
  password: [{ required: true, message: "请输入密码" }],
};

onMounted(() => {
  getList();
  loadCommunityOptions();
});

async function getList() {
  loading.value = true;
  try {
    const res: any = await listUser(queryParams);
    tableData.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

async function loadCommunityOptions() {
  try {
    const res: any = await getCommunityOptions();
    communityOptions.value = res.data || [];
  } catch (e) {
    /* ignore */
  }
}

function getCommunityName(id: number) {
  if (!id) return "-";
  const item = communityOptions.value.find((c) => c.id === id);
  return item?.name || "-";
}

function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
function resetQuery() {
  Object.assign(queryParams, { pageNum: 1, userName: "", status: undefined });
  getList();
}

function handleAdd() {
  Object.assign(form, {
    userId: undefined,
    userName: "",
    nickName: "",
    password: "",
    phonenumber: "",
    roleId: 2,
    communityId: undefined,
  });
  isEdit.value = false;
  dialogVisible.value = true;
}
function handleEdit(row: any) {
  Object.assign(form, {
    userId: row.id,
    userName: row.username,
    nickName: row.nickname,
    phonenumber: row.phone,
    roleId: row.roleId,
    communityId: row.communityId,
  });
  isEdit.value = true;
  dialogVisible.value = true;
}

function handleRoleChange() {
  // 切换为系统管理员时清空小区绑定
  if (form.roleId === 1) {
    form.communityId = undefined;
  }
}

async function submitForm() {
  await formRef.value.validate();
  if (isEdit.value) {
    await updateUser(form);
  } else {
    await addUser(form);
  }
  ElMessage.success("操作成功");
  dialogVisible.value = false;
  getList();
}
async function handleStatusChange(row: any) {
  try {
    await changeUserStatus({ userId: row.id, status: row.status });
    ElMessage.success("操作成功");
  } catch {
    row.status = row.status === 1 ? 0 : 1;
  }
}
async function handleResetPwd(row: any) {
  const { value } = await ElMessageBox.prompt("请输入新密码", "重置密码", {
    inputType: "password",
  });
  await resetUserPwd({ userId: row.id, password: value });
  ElMessage.success("重置成功");
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？");
  await delUser(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
