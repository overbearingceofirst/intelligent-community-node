<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/payment/item/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="handleAdd">新增项目</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="项目名称" width="150" />
        <el-table-column prop="code" label="项目编码" width="120" />
        <el-table-column prop="price" label="单价" width="100" align="right"
          ><template #default="{ row }"
            >¥{{ row.price }}</template
          ></el-table-column
        >
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="row.status === 1 ? 'success' : 'info'">{{
              row.status === 1 ? "启用" : "禁用"
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
    </el-card>
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑' : '新增'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name"
          ><el-input v-model="form.name"
        /></el-form-item>
        <el-form-item label="编码" prop="code"
          ><el-input v-model="form.code" :disabled="isEdit"
        /></el-form-item>
        <el-form-item label="单价" prop="price"
          ><el-input-number v-model="form.price" :min="0" :precision="2"
        /></el-form-item>
        <el-form-item label="单位" prop="unit"
          ><el-input v-model="form.unit"
        /></el-form-item>
        <el-form-item label="状态"
          ><el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
        /></el-form-item>
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
  listPaymentItem,
  addPaymentItem,
  updatePaymentItem,
  delPaymentItem,
} from "@/api/payment";

const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const form = reactive({
  id: 0,
  name: "",
  code: "",
  price: 0,
  unit: "",
  status: 1,
});
const rules = {
  name: [{ required: true, message: "请输入名称" }],
  code: [{ required: true, message: "请输入编码" }],
  unit: [{ required: true, message: "请输入单位" }],
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listPaymentItem({ pageNum: 1, pageSize: 100 });
    tableData.value = res.rows;
  } finally {
    loading.value = false;
  }
}
function handleAdd() {
  Object.assign(form, {
    id: 0,
    name: "",
    code: "",
    price: 0,
    unit: "",
    status: 1,
  });
  isEdit.value = false;
  dialogVisible.value = true;
}
function handleEdit(row: any) {
  Object.assign(form, row);
  isEdit.value = true;
  dialogVisible.value = true;
}
async function submitForm() {
  await formRef.value.validate();
  if (isEdit.value) {
    await updatePaymentItem(form);
  } else {
    await addPaymentItem(form);
  }
  ElMessage.success("操作成功");
  dialogVisible.value = false;
  getList();
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？");
  await delPaymentItem(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
