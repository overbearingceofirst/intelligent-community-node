/**
 * 路由配置 - 社区智慧便民服务系统
 */
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import { getToken } from "@/utils/auth";
import { useUserStore } from "@/store/user";

// 公共路由（无需登录）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录", hidden: true },
  },
  {
    path: "/401",
    name: "401",
    component: () => import("@/views/error/401.vue"),
    meta: { title: "无权限", hidden: true },
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/error/404.vue"),
    meta: { title: "404", hidden: true },
  },
];

// 动态路由（需要权限）
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "数据中心", icon: "DataAnalysis", affix: true },
      },
    ],
  },
  // 系统管理
  {
    path: "/system",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/system/admin",
    meta: { title: "系统管理", icon: "Setting", roles: ["admin"] },
    children: [
      {
        path: "admin",
        name: "Admin",
        component: () => import("@/views/system/admin/index.vue"),
        meta: { title: "管理员账号", icon: "UserFilled", roles: ["admin"] },
      },
      {
        path: "role",
        name: "Role",
        component: () => import("@/views/system/role/index.vue"),
        meta: { title: "角色管理", icon: "User", roles: ["admin"] },
      },
      {
        path: "menu",
        name: "Menu",
        component: () => import("@/views/system/menu/index.vue"),
        meta: { title: "菜单管理", icon: "Menu", roles: ["admin"] },
      },
      {
        path: "log",
        name: "Log",
        component: () => import("@/views/system/log/index.vue"),
        meta: { title: "操作日志", icon: "Document" },
      },
    ],
  },
  // 居民管理
  {
    path: "/resident",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/resident/list",
    meta: { title: "居民管理", icon: "User" },
    children: [
      {
        path: "list",
        name: "ResidentList",
        component: () => import("@/views/resident/list/index.vue"),
        meta: { title: "居民列表", icon: "List" },
      },
    ],
  },
  // 报修管理
  {
    path: "/repair",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/repair/list",
    meta: { title: "报修管理", icon: "Tools" },
    children: [
      {
        path: "list",
        name: "RepairList",
        component: () => import("@/views/repair/list/index.vue"),
        meta: { title: "报修工单", icon: "Tickets" },
      },
    ],
  },
  // 缴费管理
  {
    path: "/payment",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/payment/item",
    meta: { title: "缴费管理", icon: "Money" },
    children: [
      {
        path: "item",
        name: "PaymentItem",
        component: () => import("@/views/payment/item/index.vue"),
        meta: { title: "缴费项目", icon: "PriceTag" },
      },
      {
        path: "bill",
        name: "PaymentBill",
        component: () => import("@/views/payment/bill/index.vue"),
        meta: { title: "账单管理", icon: "Wallet" },
      },
    ],
  },
  // 通知公告
  {
    path: "/notice",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/notice/list",
    meta: { title: "通知公告", icon: "Bell" },
    children: [
      {
        path: "list",
        name: "NoticeList",
        component: () => import("@/views/notice/list/index.vue"),
        meta: { title: "公告管理", icon: "ChatDotRound" },
      },
    ],
  },
  // 邻里互助
  {
    path: "/mutual",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/mutual/list",
    meta: { title: "邻里互助", icon: "Connection" },
    children: [
      {
        path: "list",
        name: "MutualList",
        component: () => import("@/views/mutual/list/index.vue"),
        meta: { title: "互助管理", icon: "Promotion" },
      },
    ],
  },
  // 闲置物品
  {
    path: "/idle",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/idle/list",
    meta: { title: "闲置物品", icon: "ShoppingCart" },
    children: [
      {
        path: "list",
        name: "IdleList",
        component: () => import("@/views/idle/list/index.vue"),
        meta: { title: "闲置管理", icon: "Goods" },
      },
    ],
  },
  // 访客管理
  {
    path: "/visitor",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/visitor/list",
    meta: { title: "访客管理", icon: "Avatar" },
    children: [
      {
        path: "list",
        name: "VisitorList",
        component: () => import("@/views/visitor/list/index.vue"),
        meta: { title: "访客记录", icon: "Postcard" },
      },
    ],
  },
  // 积分管理
  {
    path: "/points",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/points/rule",
    meta: { title: "积分管理", icon: "Medal" },
    children: [
      {
        path: "rule",
        name: "PointsRule",
        component: () => import("@/views/points/rule/index.vue"),
        meta: { title: "兑换说明", icon: "Document" },
      },
      {
        path: "exchange",
        name: "PointsExchange",
        component: () => import("@/views/points/exchange/index.vue"),
        meta: { title: "兑换商品", icon: "ShoppingCart" },
      },
      {
        path: "flow",
        name: "PointsFlow",
        component: () => import("@/views/points/flow/index.vue"),
        meta: { title: "积分流水", icon: "List" },
      },
    ],
  },
  // 系统设置
  {
    path: "/setting",
    component: () => import("@/views/layout/index.vue"),
    redirect: "/setting/community",
    meta: { title: "系统设置", icon: "Operation" },
    children: [
      {
        path: "community",
        name: "Community",
        component: () => import("@/views/setting/community/index.vue"),
        meta: { title: "小区信息", icon: "OfficeBuilding" },
      },
      {
        path: "building",
        name: "Building",
        component: () => import("@/views/setting/building/index.vue"),
        meta: { title: "楼栋管理", icon: "School" },
      },
    ],
  },
  // 兜底路由
  { path: "/:pathMatch(.*)*", redirect: "/404", meta: { hidden: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...asyncRoutes],
  scrollBehavior: () => ({ top: 0 }),
});

const whiteList = ["/login", "/401", "/404"];

router.beforeEach(async (to, _from, next) => {
  NProgress.start();
  const hasToken = getToken();

  if (hasToken) {
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else {
      const userStore = useUserStore();
      if (userStore.roles.length > 0) {
        // 检查路由权限
        const roles = to.meta?.roles as string[] | undefined;
        if (roles && !roles.some((r) => userStore.roles.includes(r))) {
          next("/401");
          NProgress.done();
        } else {
          next();
        }
      } else {
        try {
          await userStore.getInfo();
          next({ ...to, replace: true });
        } catch (error) {
          userStore.resetToken();
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
