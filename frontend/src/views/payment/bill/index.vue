<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/payment/bill/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="账单月份"
          ><el-date-picker
            v-model="queryParams.billMonth"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            placeholder="选择月份"
        /></el-form-item>
        <el-form-item label="状态"
          ><el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
            ><el-option label="未缴" :value="0" /><el-option
              label="已缴"
              :value="1" /><el-option label="逾期" :value="2" /></el-select
        ></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="handleQuery">搜索</el-button
          ><el-button @click="resetQuery">重置</el-button></el-form-item
        >
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="handleAdd">新增账单</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="residentId" label="居民ID" width="100" />
        <el-table-column
          prop="billMonth"
          label="账单月份"
          width="120"
          align="center"
        />
        <el-table-column prop="amount" label="金额" width="100" align="right"
          ><template #default="{ row }"
            >¥{{ row.amount }}</template
          ></el-table-column
        >
        <el-table-column label="状态" width="100" align="center"
          ><template #default="{ row }"
            ><el-tag
              :type="
                row.status === 1
                  ? 'success'
                  : row.status === 2
                    ? 'danger'
                    : 'warning'
              "
              >{{
                row.status === 1 ? "已缴" : row.status === 2 ? "逾期" : "未缴"
              }}</el-tag
            ></template
          ></el-table-column
        >
        <el-table-column label="操作" width="150" align="center"
          ><template #default="{ row }"
            ><el-button
              link
              type="primary"
              @click="handleMarkPaid(row)"
              v-if="row.status !== 1"
              >标记已缴</el-button
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
    <el-dialog v-model="dialogVisible" title="新增账单" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="居民ID" prop="residentId"
          ><el-input-number v-model="form.residentId" :min="1"
        /></el-form-item>
        <el-form-item label="项目ID" prop="itemId"
          ><el-input-number v-model="form.itemId" :min="1"
        /></el-form-item>
        <el-form-item label="金额" prop="amount"
          ><el-input-number v-model="form.amount" :min="0" :precision="2"
        /></el-form-item>
        <el-form-item label="账单月份" prop="billMonth"
          ><el-date-picker
            v-model="form.billMonth"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
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
  listPaymentBill,
  addPaymentBill,
  changePaymentBillStatus,
  delPaymentBill,
} from "@/api/payment";

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const formRef = ref();
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  billMonth: "",
  status: undefined as number | undefined,
});
const form = reactive({ residentId: 0, itemId: 0, amount: 0, billMonth: "" });
const rules = {
  residentId: [{ required: true, message: "请输入居民ID" }],
  billMonth: [{ required: true, message: "请选择月份" }],
};

onMounted(() => getList());

async function getList() {
  loading.value = true;
  try {
    const res: any = await listPaymentBill(queryParams);
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
  Object.assign(queryParams, { pageNum: 1, billMonth: "", status: undefined });
  getList();
}
function handleAdd() {
  Object.assign(form, { residentId: 0, itemId: 0, amount: 0, billMonth: "" });
  dialogVisible.value = true;
}
async function submitForm() {
  await formRef.value.validate();
  await addPaymentBill(form);
  ElMessage.success("新增成功");
  dialogVisible.value = false;
  getList();
}
async function handleMarkPaid(row: any) {
  await ElMessageBox.confirm("确认标记为已缴费？");
  await changePaymentBillStatus({ id: row.id, status: 1 });
  ElMessage.success("操作成功");
  getList();
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？");
  await delPaymentBill(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
