<!-- filepath: /Users/danxiao/Documents/other/intelligent-community-node/frontend/src/views/dashboard/index.vue -->
<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
        v-for="item in statsCards"
        :key="item.title"
      >
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: item.bg }">
            <el-icon :size="28"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.title }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header
            ><span class="card-title">近30天报修趋势</span></template
          >
          <div ref="repairChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header
            ><span class="card-title">近30天互助趋势</span></template
          >
          <div ref="mutualChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项列表 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span class="card-title">待处理工单</span>
              <el-button
                link
                type="primary"
                @click="$router.push('/repair/list')"
                >更多 &gt;</el-button
              >
            </div>
          </template>
          <el-table
            :data="pendingRepairs"
            size="small"
            max-height="280"
            v-loading="repairLoading"
          >
            <el-table-column
              prop="id"
              label="工单号"
              width="80"
              align="center"
            />
            <el-table-column
              prop="title"
              label="标题"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column prop="createdAt" label="提交时间" width="160">
              <template #default="{ row }">{{
                formatDate(row.createdAt)
              }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="goRepair(row)"
                  >处理</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="!repairLoading && pendingRepairs.length === 0"
            description="暂无待处理工单"
            :image-size="60"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span class="card-title">待审核居民</span>
              <el-button
                link
                type="primary"
                @click="$router.push('/resident/list')"
                >更多 &gt;</el-button
              >
            </div>
          </template>
          <el-table
            :data="pendingResidents"
            size="small"
            max-height="280"
            v-loading="residentLoading"
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="realName" label="姓名" width="100" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column prop="createdAt" label="注册时间" width="160">
              <template #default="{ row }">{{
                formatDate(row.createdAt)
              }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="goResident(row)"
                  >审核</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="!residentLoading && pendingResidents.length === 0"
            description="暂无待审核居民"
            :image-size="60"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import { User, Tools, Money, Bell } from "@element-plus/icons-vue";
import {
  getStats,
  getRepairTrend,
  getMutualTrend,
  getPendingRepairs,
  getPendingResidents,
} from "@/api/dashboard";

const router = useRouter();

const statsCards = ref([
  {
    title: "总居民数",
    value: 0,
    icon: "User",
    bg: "linear-gradient(135deg, #409eff 0%, #36cfc9 100%)",
  },
  {
    title: "待处理报修",
    value: 0,
    icon: "Tools",
    bg: "linear-gradient(135deg, #e6a23c 0%, #ffc53d 100%)",
  },
  {
    title: "本月缴费额",
    value: "¥0",
    icon: "Money",
    bg: "linear-gradient(135deg, #67c23a 0%, #95de64 100%)",
  },
  {
    title: "本月互助",
    value: 0,
    icon: "Bell",
    bg: "linear-gradient(135deg, #f56c6c 0%, #ff7875 100%)",
  },
]);

const repairChartRef = ref<HTMLElement | null>(null);
const mutualChartRef = ref<HTMLElement | null>(null);
let repairChart: echarts.ECharts | null = null;
let mutualChart: echarts.ECharts | null = null;

const pendingRepairs = ref<any[]>([]);
const pendingResidents = ref<any[]>([]);
const repairLoading = ref(false);
const residentLoading = ref(false);

onMounted(async () => {
  await loadStats();
  await loadPendingData();
  await nextTick();
  initCharts();
  await loadChartData();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  repairChart?.dispose();
  mutualChart?.dispose();
});

function handleResize() {
  repairChart?.resize();
  mutualChart?.resize();
}

async function loadStats() {
  try {
    const res: any = await getStats();
    if (res.code === 200) {
      statsCards.value[0].value = res.data.totalResidents;
      statsCards.value[1].value = res.data.pendingRepairs;
      statsCards.value[2].value = `¥${res.data.monthlyPayment}`;
      statsCards.value[3].value = res.data.monthlyMutual;
    }
  } catch (e) {
    /* ignore */
  }
}

async function loadPendingData() {
  // 待处理工单
  repairLoading.value = true;
  try {
    const res: any = await getPendingRepairs();
    if (res.code === 200) {
      pendingRepairs.value = res.data || [];
    }
  } catch (e) {
    /* ignore */
  } finally {
    repairLoading.value = false;
  }

  // 待审核居民
  residentLoading.value = true;
  try {
    const res: any = await getPendingResidents();
    if (res.code === 200) {
      pendingResidents.value = res.data || [];
    }
  } catch (e) {
    /* ignore */
  } finally {
    residentLoading.value = false;
  }
}

function initCharts() {
  if (repairChartRef.value) {
    repairChart = echarts.init(repairChartRef.value);
  }
  if (mutualChartRef.value) {
    mutualChart = echarts.init(mutualChartRef.value);
  }
}

async function loadChartData() {
  // 报修趋势（柱状图）
  try {
    const res: any = await getRepairTrend();
    if (res.code === 200 && repairChart) {
      const dates = res.data.map((item: any) => item.date);
      const counts = res.data.map((item: any) => item.count);

      repairChart.setOption({
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: dates,
          axisLabel: { interval: 4, rotate: 45, fontSize: 10 },
        },
        yAxis: { type: "value", minInterval: 1 },
        series: [
          {
            name: "报修数量",
            type: "bar",
            data: counts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#409eff" },
                { offset: 1, color: "#36cfc9" },
              ]),
            },
            barWidth: "60%",
          },
        ],
      });
    }
  } catch (e) {
    /* ignore */
  }

  // 互助趋势（折线图）
  try {
    const res: any = await getMutualTrend();
    if (res.code === 200 && mutualChart) {
      const dates = res.data.map((item: any) => item.date);
      const counts = res.data.map((item: any) => item.count);

      mutualChart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: dates,
          boundaryGap: false,
          axisLabel: { interval: 4, rotate: 45, fontSize: 10 },
        },
        yAxis: { type: "value", minInterval: 1 },
        series: [
          {
            name: "互助数量",
            type: "line",
            data: counts,
            smooth: true,
            lineStyle: { color: "#67c23a", width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(103, 194, 58, 0.3)" },
                { offset: 1, color: "rgba(103, 194, 58, 0.05)" },
              ]),
            },
            itemStyle: { color: "#67c23a" },
          },
        ],
      });
    }
  } catch (e) {
    /* ignore */
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function goRepair(row: any) {
  router.push("/repair/list");
}

function goResident(row: any) {
  router.push("/resident/list");
}
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}
.stat-content .stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}
.stat-content .stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
