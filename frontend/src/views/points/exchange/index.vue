<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/points/exchange/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="小区" v-if="isAdmin">
          <el-select
            v-model="queryParams.communityId"
            placeholder="全部"
            clearable
            style="width: 150px"
            @change="handleQuery"
          >
            <el-option
              v-for="item in communityOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div style="margin-bottom: 16px; display: flex; gap: 10px">
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
        <el-button
          type="danger"
          :disabled="!selectedIds.length"
          @click="handleBatchDelete"
          >删除</el-button
        >
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="row.image"
              :preview-src-list="[row.image]"
              style="width: 60px; height: 60px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="商品名称"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="points"
          label="所需积分"
          width="100"
          align="center"
        >
          <template #default="{ row }"
            ><span style="color: #f56c6c; font-weight: 600">{{
              row.points
            }}</span></template
          >
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center" />
        <el-table-column
          prop="exchangedCount"
          label="已兑换"
          width="80"
          align="center"
        />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="所属小区" width="120" v-if="isAdmin">
          <template #default="{ row }">{{
            getCommunityName(row.communityId)
          }}</template>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="550px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item
          label="所属小区"
          prop="communityId"
          v-if="isAdmin && !isEdit"
        >
          <el-select
            v-model="form.communityId"
            placeholder="请选择小区"
            style="width: 100%"
          >
            <el-option
              v-for="item in communityOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前小区" v-if="!isAdmin && !isEdit">
          <el-tag>{{ currentCommunityName }}</el-tag>
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="所需积分" prop="points">
          <el-input-number v-model="form.points" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
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
  listPointsExchange,
  addPointsExchange,
  updatePointsExchange,
  changePointsExchangeStatus,
  delPointsExchange,
} from "@/api/points";
import { getCommunityOptions, getCommunity } from "@/api/setting";

const userStore = useUserStore();
const isAdmin = computed(() => userStore.roles.includes("admin"));

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const selectedIds = ref<number[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const communityOptions = ref<any[]>([]);
const currentCommunityName = ref("");
const currentCommunityId = ref<number | undefined>(undefined);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: "",
  status: undefined as number | undefined,
  communityId: undefined as number | undefined,
});

const form = reactive({
  id: 0,
  communityId: undefined as number | undefined,
  name: "",
  description: "",
  image: "",
  points: 100,
  stock: 0,
  status: 1,
});

const rules = {
  communityId: [{ required: true, message: "请选择小区" }],
  name: [{ required: true, message: "请输入商品名称" }],
  points: [{ required: true, message: "请输入所需积分" }],
};

onMounted(async () => {
  await loadCommunityOptions();
  if (!isAdmin.value) {
    await loadMyCommunity();
  }
  getList();
});

async function loadCommunityOptions() {
  try {
    const res: any = await getCommunityOptions();
    communityOptions.value = res.data || [];
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
    }
  } catch (e) {
    /* ignore */
  }
}

function getCommunityName(id: number) {
  const item = communityOptions.value.find((c) => c.id === id);
  return item?.name || "-";
}

async function getList() {
  loading.value = true;
  try {
    const res: any = await listPointsExchange(queryParams);
    tableData.value = res.rows || [];
    total.value = res.total || 0;
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
    name: "",
    status: undefined,
    communityId: undefined,
  });
  getList();
}

function handleSelectionChange(selection: any[]) {
  selectedIds.value = selection.map((i) => i.id);
}

function handleAdd() {
  Object.assign(form, {
    id: 0,
    communityId: isAdmin.value ? undefined : currentCommunityId.value,
    name: "",
    description: "",
    image: "",
    points: 100,
    stock: 0,
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
    await updatePointsExchange(form);
  } else {
    await addPointsExchange(form);
  }

  ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
  dialogVisible.value = false;
  getList();
}

async function handleStatusChange(row: any) {
  try {
    await changePointsExchangeStatus({ id: row.id, status: row.status });
    ElMessage.success(row.status === 1 ? "已上架" : "已下架");
  } catch {
    row.status = row.status === 1 ? 0 : 1;
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除商品「${row.name}」？`, "提示", {
    type: "warning",
  });
  await delPointsExchange(String(row.id));
  ElMessage.success("删除成功");
  getList();
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(
    `确认删除选中的 ${selectedIds.value.length} 个商品？`,
    "提示",
    { type: "warning" },
  );
  await delPointsExchange(selectedIds.value.join(","));
  ElMessage.success("删除成功");
  getList();
}
</script>
