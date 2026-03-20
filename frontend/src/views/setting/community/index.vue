<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/setting/community/index.vue -->
<template>
  <div class="app-container">
    <!-- 超级管理员：小区列表 -->
    <template v-if="isAdmin">
      <el-card shadow="never" style="margin-bottom: 16px">
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="小区名称"
            ><el-input
              v-model="queryParams.name"
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
          <el-button type="primary" @click="handleAdd">新增小区</el-button>
        </div>
        <el-table v-loading="loading" :data="tableData" stripe>
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="name" label="小区名称" width="200" />
          <el-table-column
            prop="address"
            label="地址"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column prop="phone" label="联系电话" width="130" />
          <el-table-column label="状态" width="100" align="center"
            ><template #default="{ row }"
              ><el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                row.status === 1 ? "正常" : "停用"
              }}</el-tag></template
            ></el-table-column
          >
          <el-table-column label="操作" width="150" align="center"
            ><template #default="{ row }"
              ><el-button link type="primary" @click="handleEdit(row)"
                >编辑</el-button
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
    </template>

    <!-- 物业管理员：只能编辑自己绑定的小区 -->
    <template v-else>
      <el-card shadow="never">
        <template #header
          ><span style="font-weight: 600">小区信息</span></template
        >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          style="max-width: 600px"
          v-loading="loading"
        >
          <el-form-item label="小区名称" prop="name"
            ><el-input v-model="form.name"
          /></el-form-item>
          <el-form-item label="地址"
            ><el-input v-model="form.address"
          /></el-form-item>
          <el-form-item label="联系电话"
            ><el-input v-model="form.phone"
          /></el-form-item>
          <el-form-item label="简介"
            ><el-input v-model="form.description" type="textarea" rows="4"
          /></el-form-item>
          <el-form-item
            ><el-button type="primary" @click="submitForm"
              >保存</el-button
            ></el-form-item
          >
        </el-form>
        <el-empty
          v-if="!form.id && !loading"
          description="您尚未绑定小区，请联系管理员"
        />
      </el-card>
    </template>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditDialog ? '编辑小区' : '新增小区'"
      width="550px"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="小区名称" prop="name"
          ><el-input v-model="dialogForm.name"
        /></el-form-item>
        <el-form-item label="地址"
          ><el-input v-model="dialogForm.address"
        /></el-form-item>
        <el-form-item label="联系电话"
          ><el-input v-model="dialogForm.phone"
        /></el-form-item>
        <el-form-item label="简介"
          ><el-input v-model="dialogForm.description" type="textarea" rows="3"
        /></el-form-item>
        <el-form-item label="状态"
          ><el-switch
            v-model="dialogForm.status"
            :active-value="1"
            :inactive-value="0"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="dialogVisible = false">取消</el-button
        ><el-button type="primary" @click="submitDialogForm"
          >确定</el-button
        ></template
      >
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user";
import {
  listCommunity,
  getCommunity,
  addCommunity,
  updateCommunity,
  delCommunity,
} from "@/api/setting";

const userStore = useUserStore();
const isAdmin = computed(() => userStore.roles.includes("admin"));

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const isEditDialog = ref(false);
const formRef = ref();
const dialogFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: "",
  status: undefined as number | undefined,
});
const form = reactive({
  id: 0,
  name: "",
  address: "",
  phone: "",
  description: "",
});
const dialogForm = reactive({
  id: 0,
  name: "",
  address: "",
  phone: "",
  description: "",
  status: 1,
});
const rules = { name: [{ required: true, message: "请输入小区名称" }] };

onMounted(() => {
  if (isAdmin.value) {
    getList();
  } else {
    loadMyCommunity();
  }
});

// 超级管理员：获取列表
async function getList() {
  loading.value = true;
  try {
    const res: any = await listCommunity(queryParams);
    tableData.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

// 物业管理员：获取自己绑定的小区
async function loadMyCommunity() {
  loading.value = true;
  try {
    const res: any = await getCommunity();
    if (res.data) {
      Object.assign(form, res.data);
    }
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
function resetQuery() {
  Object.assign(queryParams, { pageNum: 1, name: "", status: undefined });
  getList();
}

function handleAdd() {
  Object.assign(dialogForm, {
    id: 0,
    name: "",
    address: "",
    phone: "",
    description: "",
    status: 1,
  });
  isEditDialog.value = false;
  dialogVisible.value = true;
}

function handleEdit(row: any) {
  Object.assign(dialogForm, row);
  isEditDialog.value = true;
  dialogVisible.value = true;
}

async function submitDialogForm() {
  await dialogFormRef.value.validate();
  if (isEditDialog.value) {
    await updateCommunity(dialogForm);
  } else {
    await addCommunity(dialogForm);
  }
  ElMessage.success("操作成功");
  dialogVisible.value = false;
  getList();
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除小区「${row.name}」？`, "提示", {
    type: "warning",
  });
  await delCommunity(String(row.id));
  ElMessage.success("删除成功");
  getList();
}

// 物业管理员保存
async function submitForm() {
  await formRef.value.validate();
  await updateCommunity(form);
  ElMessage.success("保存成功");
}
</script>
