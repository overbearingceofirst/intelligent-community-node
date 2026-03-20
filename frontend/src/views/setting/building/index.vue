<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/setting/building/index.vue -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <!-- 小区选择（仅超级管理员显示） -->
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
          >新增楼栋</el-button
        >
      </div>

      <el-table
        v-loading="loading"
        :data="treeData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        stripe
      >
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }"
            ><el-tag>{{ typeMap[row.type] }}</el-tag></template
          >
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }"
            ><el-tag :type="row.status === 1 ? 'success' : 'info'">{{
              row.status === 1 ? "启用" : "禁用"
            }}</el-tag></template
          >
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAddChild(row)"
              >新增子级</el-button
            >
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
      :title="isEdit ? '编辑' : '新增'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属小区" v-if="!isEdit">
          <el-select
            v-model="form.communityId"
            placeholder="请选择"
            disabled
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
        <el-form-item label="名称" prop="name"
          ><el-input v-model="form.name"
        /></el-form-item>
        <el-form-item label="类型" v-if="!isEdit">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="楼栋" value="building" />
            <el-option label="单元" value="unit" />
            <el-option label="楼层" value="floor" />
          </el-select>
        </el-form-item>
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
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user";
import {
  listBuilding,
  addBuilding,
  updateBuilding,
  delBuilding,
  getCommunityOptions,
  getCommunity,
} from "@/api/setting";

const userStore = useUserStore();
const isAdmin = computed(() => userStore.roles.includes("admin"));

const loading = ref(false);
const treeData = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const communityOptions = ref<any[]>([]);
const currentCommunityId = ref<number | undefined>(undefined);
const currentCommunityName = ref("");

const form = reactive({
  id: 0,
  communityId: 0,
  name: "",
  parentId: 0,
  type: "building",
  sort: 0,
  status: 1,
});
const rules = { name: [{ required: true, message: "请输入名称" }] };
const typeMap: Record<string, string> = {
  building: "楼栋",
  unit: "单元",
  floor: "楼层",
};

onMounted(async () => {
  await loadCommunityOptions();
  if (!isAdmin.value) {
    // 物业管理员获取自己绑定的小区
    await loadMyCommunity();
  }
});

async function loadCommunityOptions() {
  try {
    const res: any = await getCommunityOptions();
    communityOptions.value = res.data || [];
    // 超级管理员默认选中第一个
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
    const res: any = await listBuilding({
      communityId: currentCommunityId.value,
    });
    treeData.value = buildTree(res.data || [], 0);
  } finally {
    loading.value = false;
  }
}

function buildTree(list: any[], parentId: number): any[] {
  return list
    .filter((i) => i.parentId === parentId)
    .map((i) => ({ ...i, children: buildTree(list, i.id) }));
}

function handleAdd() {
  Object.assign(form, {
    id: 0,
    communityId: currentCommunityId.value,
    name: "",
    parentId: 0,
    type: "building",
    sort: 0,
    status: 1,
  });
  isEdit.value = false;
  dialogVisible.value = true;
}

function handleAddChild(row: any) {
  Object.assign(form, {
    id: 0,
    communityId: currentCommunityId.value,
    name: "",
    parentId: row.id,
    type: row.type === "building" ? "unit" : "floor",
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
    await updateBuilding(form);
  } else {
    await addBuilding(form);
  }
  ElMessage.success("操作成功");
  dialogVisible.value = false;
  getList();
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm("确认删除？", "提示", { type: "warning" });
  await delBuilding(String(row.id));
  ElMessage.success("删除成功");
  getList();
}
</script>
