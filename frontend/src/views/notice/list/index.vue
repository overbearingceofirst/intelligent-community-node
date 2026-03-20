<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/notice/list/index.vue -->
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
            ><el-option label="草稿" :value="0" /><el-option
              label="已发布"
              :value="1" /><el-option label="已下架" :value="2" /></el-select
        ></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="handleQuery">搜索</el-button
          ><el-button @click="resetQuery">重置</el-button></el-form-item
        >
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="handleAdd">新增公告</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="类型" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag>{{ row.type === 1 ? "通知" : "公告" }}</el-tag></template
          ></el-table-column
        >
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag :type="statusMap[row.status]?.type">{{
              statusMap[row.status]?.label
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column
          prop="readCount"
          label="阅读量"
          width="100"
          align="center"
        />
        <el-table-column label="操作" width="200" align="center"
          ><template #default="{ row }"
            ><el-button link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            ><el-button
              link
              type="success"
              @click="handlePublish(row, 1)"
              v-if="row.status !== 1"
              >发布</el-button
            ><el-button
              link
              type="warning"
              @click="handlePublish(row, 2)"
              v-if="row.status === 1"
              >下架</el-button
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
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑' : '新增'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title"
          ><el-input v-model="form.title"
        /></el-form-item>
        <el-form-item label="类型"
          ><el-radio-group v-model="form.type"
            ><el-radio :label="1">通知</el-radio
            ><el-radio :label="2">公告</el-radio></el-radio-group
          ></el-form-item
        >
        <el-form-item label="内容" prop="content"
          ><el-input v-model="form.content" type="textarea" rows="5"
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
  listNotice,
  addNotice,
  updateNotice,
  publishNotice,
  delNotice,
} from "@/api/notice";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: "",
  status: undefined as number | undefined,
});
const form = reactive({ id: 0, title: "", type: 1, content: "" });
const rules = {
  title: [{ required: true, message: "请输入标题" }],
  content: [{ required: true, message: "请输入内容" }],
};
const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: "草稿", type: "info" },
  1: { label: "已发布", type: "success" },
  2: { label: "已下架", type: "warning" },
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listNotice(queryParams);
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
function handleAdd() {
  Object.assign(form, { id: 0, title: "", type: 1, content: "" });
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
    await updateNotice(form);
  } else {
    await addNotice(form);
  }
  ElMessage.success("操作成功");
  dialogVisible.value = false;
  getList();
}
async function handlePublish(row: any, status: number) {
  await publishNotice({ id: row.id, status });
  ElMessage.success(status === 1 ? "发布成功" : "已下架");
  getList();
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？");
  await delNotice(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
