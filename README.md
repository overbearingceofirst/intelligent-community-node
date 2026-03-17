# intelligent-community-node

Node.js backend for Intelligent Community (express + MySQL + JWT)

## 目标概述（按角色）

- 普通居民（小程序）
  - 实名认证、房屋绑定
  - 缴费查询与小程序内提醒（不发送邮件）
  - 报修提交与进度查看
  - 政务导航、快递指引
  - 发布/领取互助、发布闲置物品
  - 访客预约二维码、积分查看与兑换、消息与隐私设置

- 物业管理员（小程序 + 管理端）
  - 居民信息审核、报修工单处理
  - 访客出入管理与核验、发布缴费通知与公告
  - 楼栋级精准推送、互助内容审核、积分核算、服务数据查看

- 系统管理员（管理端）
  - 账号管理、权限分配、社区信息配置
  - 积分规则设置、数据维护、系统监控

## 当前实现（骨架）

- Express + MySQL + JWT 骨架
- 基础模型：users, houses, repairs, payments, visitors
- 身份认证与角色中间件
- 站内通知（notifications 表 + push stub），系统通过写通知记录实现小程序内提醒；邮件功能已禁用
- 数据库初始化脚本（database/init.sql）

## 接下来的开发建议（优先级）

1. 完成用户注册/登录/实名认证流程（高）
2. 房屋绑定及房屋与用户关系管理（高）
3. 报修工单生命周期（提交→受理→处理→评价）（高）
4. 支付与缴费通知（查询、账单、在小程序内提醒）（中）
5. 访客预约二维码生成与校验（中）
6. 积分系统基础与兑换接口（中）
7. 管理端权限与多角色接口（高）
8. RPC/消息推送（如楼栋精准推送）设计（低）

## 快速启动（开发）

1. 创建 .env（参考 .env.example）
2. 安装依赖：

```bash
npm install
```

3. 初始化数据库（执行 database/init.sql）
4. 启动服务：

```bash
node server.js
```

## 数据库运行与初始化

项目依赖 MySQL 数据库。可以按以下方式准备：

1. **本机安装 MySQL**
   - macOS（Homebrew）
     ```bash
     brew install mysql
     brew services start mysql
     ```
   - Ubuntu/Debian
     ```bash
     sudo apt update
     sudo apt install mysql-server
     sudo systemctl start mysql
     ```

2. **创建数据库与用户**  
   在 MySQL 客户端登录（root 无密码可直接，或 `sudo mysql`），执行：

   ```sql
   CREATE DATABASE IF NOT EXISTS intelligent_community
     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   CREATE USER IF NOT EXISTS 'ic_user'@'localhost' IDENTIFIED BY '123456';
   GRANT ALL PRIVILEGES ON intelligent_community.* TO 'ic_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **导入表结构**  
   切换到项目根目录，执行：

   ```bash
   cd /Users/danxiao/Documents/other/intelligent-community-node
   mysql -h 127.0.0.1 -P 3306 -u ic_user -p intelligent_community < database/init.sql
   ```

   输入密码 `123456`（或你设定的密码）。

4. **使用 Docker（可选）**
   - 编辑 `.env.docker` 中的数据库配置。
   - 运行：`docker-compose up --build -d`。
   - 容器启动后，MySQL 会自动执行 `./database/init.sql`。
   - 手动导入可以运行：`chmod +x scripts/init_db.sh && ./scripts/init_db.sh`。

5. **验证数据库连接**

   ```bash
   mysql -h 127.0.0.1 -P 3306 -u ic_user -p -e "SHOW TABLES;"
   ```

6. **常见错误**
   - `Access denied`：密码或 host 不匹配，请使用上述 SQL 重置用户。
   - `Can't connect to server`：确保 MySQL 服务已启动且在 127.0.0.1:3306 监听。
   - 初始化重复字段或语法错误，请检查 `database/init.sql` 是否已修改。

完成后，再按照“快速启动”步骤安装依赖并跑起服务即可。

## 目录说明（建议）

- server.js — 入口
- src/config — 数据库与配置信息
- src/routes — 路由定义
- src/controllers — 业务逻辑
- src/middleware — 认证/权限
- database/init.sql — 数据表初始化脚本

## 常见问题

- 找不到 database/init.sql（zsh: no such file or directory）
  - 请先切换到项目根目录再执行导入：
    ```bash
    cd /Users/danxiao/Documents/other/intelligent-community-node
    mysql -u ic_user -p intelligent_community < database/init.sql
    ```
  - 或使用绝对路径：
    ```bash
    mysql -u ic_user -p intelligent_community < /Users/danxiao/Documents/other/intelligent-community-node/database/init.sql
    ```
