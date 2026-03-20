<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/points/rule/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <!-- 小区选择 -->
      <div
        style="
          margin-bottom: 16px;
          display: flex;
          gap: 16px;
          align-items: center;
        "
      >
        <template v-if="isAdmin">
          <span>选择小区：</span>
          <el-select
            v-model="currentCommunityId"
            placeholder="请选择小区"
            style="width: 200px"
            @change="getList"
          >
            <el-option
              v-for="item in communityOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </template>
        <template v-else>
          <span
            >当前小区：<el-tag>{{ currentCommunityName }}</el-tag></span
          >
        </template>
        <el-button
          type="primary"
          @click="handleAdd"
          :disabled="!currentCommunityId"
          >新增说明</el-button
        >
      </div>

      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column
          prop="content"
          label="说明内容"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }"
            ><el-tag :type="row.status === 1 ? 'success' : 'info'">{{
              row.status === 1 ? "启用" : "禁用"
            }}</el-tag></template
          >
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button link type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑说明' : '新增说明'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title"
          ><el-input v-model="form.title" placeholder="请输入标题"
        /></el-form-item>
        <el-form-item label="说明内容" prop="content"
          ><el-input
            v-model="form.content"
            type="textarea"
            rows="6"
            placeholder="请输入积分兑换说明内容"
        /></el-form-item>
        <el-form-item label="排序"
          ><el-input-number v-model="form.sort" :min="0"
        /></el-form-item>
        <el-form-item label="状态"
          ><el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user";
import {
  listPointsRule,
  addPointsRule,
  updatePointsRule,
  delPointsRule,
} from "@/api/points";
import { getCommunityOptions, getCommunity } from "@/api/setting";

const userStore = useUserStore();
const isAdmin = computed(() => userStore.roles.includes("admin"));

const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const communityOptions = ref<any[]>([]);
const currentCommunityId = ref<number | undefined>(undefined);
const currentCommunityName = ref("");

const form = reactive({
  id: 0,
  communityId: undefined as number | undefined,
  title: "",
  content: "",
  sort: 0,
  status: 1,
});

const rules = {
  title: [{ required: true, message: "请输入标题" }],
  content: [{ required: true, message: "请输入说明内容" }],
};

onMounted(async () => {
  await loadCommunityOptions();
  if (!isAdmin.value) {
    await loadMyCommunity();
  }
});

async function loadCommunityOptions() {
  try {
    const res: any = await getCommunityOptions();
    communityOptions.value = res.data || [];
    if (isAdmin.value && communityOptions.value.length > 0) {
      currentCommunityId.value = communityOptions.value[0].id;
      getList();
    }
  } catch (e) {
    /* ignore */
  }
}

async function loadMyCommunity() {
  try {
    const res: any = await getCommunity();
    if (res.data) {
      currentCommunityId.value = res.data.id;
      currentCommunityName.value = res.data.name;
      getList();
    }
  } catch (e) {
    /* ignore */
  }
}

async function getList() {
  if (!currentCommunityId.value) return;
  loading.value = true;
  try {
    const res: any = await listPointsRule({
      communityId: currentCommunityId.value,
    });
    tableData.value = res.data || [];
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  Object.assign(form, {
    id: 0,
    communityId: currentCommunityId.value,
    title: "",
    content: "",
    sort: 0,
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
    await updatePointsRule(form);
  } else {
    await addPointsRule(form);
  }
  ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
  dialogVisible.value = false;
  getList();
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除「${row.title}」？`, "提示", {
    type: "warning",
  });
  await delPointsRule(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
