/**
 * 初始化管理员账号和角色
 * 首次启动时自动创建
 */
import bcrypt from "bcryptjs";
import { User, Role, Menu } from "../models";
import { logger } from "./logger";

export async function initAdmin() {
  try {
    // 1. 初始化菜单
    await initMenus();

    // 2. 初始化超级管理员角色
    let adminRole = await Role.findOne({ where: { code: "admin" } });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "超级管理员",
        code: "admin",
        sort: 1,
        status: 1,
        menuIds: "[]",
        remark: "超级管理员，拥有所有权限",
      });
      logger.info("✅ 已创建超级管理员角色");
    }

    // 3. 初始化普通角色
    const commonRole = await Role.findOne({ where: { code: "common" } });
    if (!commonRole) {
      await Role.create({
        name: "普通角色",
        code: "common",
        sort: 2,
        status: 1,
        menuIds: "[]",
        remark: "普通角色",
      });
      logger.info("✅ 已创建普通角色");
    }

    // 4. 初始化管理员账号
    const adminUser = await User.findOne({ where: { username: "admin" } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        password: hashedPassword,
        nickname: "超级管理员",
        roleId: adminRole.id,
        status: 1,
        delFlag: 0,
      });
      logger.info("✅ 已创建管理员账号: admin / admin123");
    }
  } catch (error) {
    logger.error("初始化管理员失败:", error);
  }
}

/**
 * 初始化系统菜单
 */
async function initMenus() {
  const menuCount = await Menu.count();
  if (menuCount > 0) return;

  const menus = [
    {
      id: 1,
      name: "系统管理",
      parentId: 0,
      orderNum: 1,
      path: "system",
      component: "",
      menuType: "M",
      visible: 1,
      status: 1,
      icon: "system",
    },
    {
      id: 100,
      name: "用户管理",
      parentId: 1,
      orderNum: 1,
      path: "user",
      component: "system/user/index",
      menuType: "C",
      visible: 1,
      status: 1,
      perms: "system:user:list",
      icon: "user",
    },
    {
      id: 101,
      name: "角色管理",
      parentId: 1,
      orderNum: 2,
      path: "role",
      component: "system/role/index",
      menuType: "C",
      visible: 1,
      status: 1,
      perms: "system:role:list",
      icon: "peoples",
    },
    {
      id: 102,
      name: "菜单管理",
      parentId: 1,
      orderNum: 3,
      path: "menu",
      component: "system/menu/index",
      menuType: "C",
      visible: 1,
      status: 1,
      perms: "system:menu:list",
      icon: "tree-table",
    },
    {
      id: 108,
      name: "日志管理",
      parentId: 1,
      orderNum: 9,
      path: "log",
      component: "",
      menuType: "M",
      visible: 1,
      status: 1,
      icon: "log",
    },
    {
      id: 500,
      name: "操作日志",
      parentId: 108,
      orderNum: 1,
      path: "operlog",
      component: "monitor/operlog/index",
      menuType: "C",
      visible: 1,
      status: 1,
      perms: "monitor:operlog:list",
      icon: "form",
    },
  ];

  for (const menu of menus) {
    await Menu.create(menu as any);
  }
  logger.info("✅ 已初始化系统菜单");
}
