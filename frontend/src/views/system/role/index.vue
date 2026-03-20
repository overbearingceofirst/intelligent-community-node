<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/system/role/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="handleAdd">新增角色</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="权限字符" width="150" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
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
            ><el-button
              link
              type="danger"
              @click="handleDelete(row)"
              :disabled="row.code === 'admin'"
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
        <el-form-item label="名称" prop="roleName"
          ><el-input v-model="form.roleName"
        /></el-form-item>
        <el-form-item label="编码" prop="roleKey"
          ><el-input v-model="form.roleKey" :disabled="isEdit"
        /></el-form-item>
        <el-form-item label="排序"
          ><el-input-number v-model="form.roleSort" :min="0"
        /></el-form-item>
        <el-form-item label="备注"
          ><el-input v-model="form.remark" type="textarea"
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
import { listRole, addRole, updateRole, delRole } from "@/api/role";

const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const form = reactive({
  roleId: undefined as number | undefined,
  roleName: "",
  roleKey: "",
  roleSort: 0,
  remark: "",
});
const rules = {
  roleName: [{ required: true, message: "请输入名称" }],
  roleKey: [{ required: true, message: "请输入编码" }],
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listRole({ pageNum: 1, pageSize: 100 });
    tableData.value = res.rows;
  } finally {
    loading.value = false;
  }
}
function handleAdd() {
  Object.assign(form, {
    roleId: undefined,
    roleName: "",
    roleKey: "",
    roleSort: 0,
    remark: "",
  });
  isEdit.value = false;
  dialogVisible.value = true;
}
function handleEdit(row: any) {
  Object.assign(form, {
    roleId: row.id,
    roleName: row.name,
    roleKey: row.code,
    roleSort: row.sort,
    remark: row.remark,
  });
  isEdit.value = true;
  dialogVisible.value = true;
}
async function submitForm() {
  await formRef.value.validate();
  if (isEdit.value) {
    await updateRole(form);
  } else {
    await addRole(form);
  }
  ElMessage.success("操作成功");
  dialogVisible.value = false;
  getList();
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？");
  await delRole(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
