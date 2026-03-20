# 社区智慧便民服务信息系统 - 后台管理系统

基于 Node.js + Express + TypeScript + Vue3 + Element Plus 开发，严格复刻若依（RuoYi-Vue）样式。

## 技术栈

- **后端**：Node.js + Express + TypeScript + Sequelize + JWT + Winston
- **前端**：Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router
- **数据库**：MySQL 8.x
- **兼容性**：Chrome 80+

## 目录结构

```
root/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # Sequelize 模型
│   │   ├── routes/          # 路由定义
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   └── app.ts           # 入口文件
│   ├── .env                 # 环境变量
│   └── package.json
├── frontend/                # 前端应用（若依风格）
│   ├── src/
│   │   ├── api/             # 接口封装
│   │   ├── components/      # 通用组件
│   │   ├── router/          # 路由配置
│   │   ├── store/           # 状态管理
│   │   ├── styles/          # 样式文件
│   │   ├── views/           # 页面组件
│   │   └── main.ts
│   └── package.json
└── README.md
```

## 快速启动

### 1. 启动 MySQL 并创建数据库

```bash
# 启动 MySQL
brew services start mysql

# 创建数据库和用户
mysql -u root -p

# 执行以下 SQL
CREATE DATABASE IF NOT EXISTS intelligent_community CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER IF NOT EXISTS 'ic_user'@'localhost' IDENTIFIED BY '123456';
CREATE USER IF NOT EXISTS 'ic_user'@'127.0.0.1' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON intelligent_community.* TO 'ic_user'@'localhost';
GRANT ALL PRIVILEGES ON intelligent_community.* TO 'ic_user'@'127.0.0.1';
FLUSH PRIVILEGES;
```

### 2. 启动后端

```bash
cd backend
npm install
npm run dev
# 运行在 http://localhost:3000
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
# 运行在 http://localhost:8080
```

### 4. 访问系统

- 前端地址：http://localhost:8080
- **系统管理员**：`admin` / `123456`（全部权限）
- **物业管理员**：`property` / `123456`（部分权限）

## 功能模块

### 系统管理（仅系统管理员）

- [x] 管理员账号管理（CRUD、冻结/解冻、重置密码）
- [x] 角色管理（系统管理员/物业管理员）
- [x] 菜单管理（树形菜单、排序）
- [x] 操作日志（查看、筛选、删除）

### 居民管理

- [x] 居民列表（多条件筛选、启用/禁用）
- [x] 实名认证审核
- [x] 房屋绑定审核

### 报修管理

- [x] 报修工单列表（状态管理）
- [x] 工单处理（派单、完成）
- [x] 工单统计

### 缴费管理

- [x] 缴费项目（物业费/水费/电费）
- [x] 账单管理（录入、导入、提醒）

### 通知公告

- [x] 公告管理（CRUD、按楼栋推送）
- [x] 定时发布、上下架

### 邻里互助

- [x] 互助需求审核
- [x] 任务完成确认
- [x] 积分发放

### 闲置物品

- [x] 闲置信息审核
- [x] 上下架管理

### 访客管理

- [x] 访客预约记录
- [x] 核验记录查看

### 积分管理

- [x] 积分规则配置（仅系统管理员）
- [x] 积分流水查看
- [x] 兑换审核

### 系统设置

- [x] 小区信息配置（系统管理员可改，物业管理员只读）
- [x] 楼栋管理

## 权限设计

| 角色       | 权限范围                                                     |
| ---------- | ------------------------------------------------------------ |
| 系统管理员 | 全部功能，包括新增/删除小区、管理员账号管理                  |
| 物业管理员 | 需绑定小区，只能编辑自己绑定的小区信息，其他业务功能正常使用 |

### 小区绑定说明

- 物业管理员创建时需要选择绑定的小区
- 物业管理员只能查看和编辑自己绑定的小区信息
- 系统管理员可以管理所有小区（新增、编辑、删除）
- 有用户绑定的小区无法删除

## 常见问题排查

### 1. 数据库连接失败

```bash
# 确认 MySQL 运行
brew services list

# 启动 MySQL
brew services start mysql

# 测试连接
mysql -h 127.0.0.1 -P 3306 -u ic_user -p
```

### 2. 前端登录接口报错

```bash
# 确认后端运行
curl http://localhost:3000/health

# 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 3. 端口被占用

```bash
lsof -iTCP:3000 -sTCP:LISTEN
lsof -iTCP:8080 -sTCP:LISTEN
kill <pid>
```

## 开发命令

```bash
# 启动 MySQL
brew services start mysql

# 后端开发
cd backend && npm run dev

# 前端开发
cd frontend && npm run dev

# 健康检查
curl http://localhost:3000/health
```
