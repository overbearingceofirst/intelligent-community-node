# 数据库安装与初始化（简明步骤）

说明：下面给出三种常用方式：A. 使用 Navicat（GUI） B. 命令行（CLI） C. Docker（容器）。任选其一按步骤执行。

前提

- 已安装 MySQL 或 Docker（若用 Docker 可跳到 C）。
- 在项目根有 database/init.sql（已随项目提供）。
- 请在执行前备份重要数据。

A. Navicat（GUI）方式（推荐初学者）

1. 打开 Navicat → 新建 MySQL 连接：
   - 连接名：intelligent-community-db（随意）
   - Host：127.0.0.1
   - Port：3306
   - User：root（或你已有的管理员账号）
   - Password：你的密码
2. 测试连接 → 连接成功后右键连接 → New Database：
   - Database name: intelligent_community
   - Charset: utf8mb4, Collation: utf8mb4_general_ci
3. （建议）创建专用用户：
   - 在 Navicat SQL Editor 执行：
     ```sql
     CREATE USER 'ic_user'@'localhost' IDENTIFIED BY 'StrongP@ssw0rd';
     GRANT ALL PRIVILEGES ON intelligent_community.* TO 'ic_user'@'localhost';
     FLUSH PRIVILEGES;
     ```
4. 导入初始化脚本：
   - 选中 intelligent_community → 右键 Execute SQL File → 选择 `database/init.sql` → 执行
   - 若出现 ALTER/ENUM 语法错误，请按错误提示注释或手动修正相应 ALTER 语句后再执行。

B. 命令行（CLI）方式

1. 启动 MySQL 服务（视系统）：
   - macOS(Homebrew): `brew services start mysql`
   - Ubuntu: `sudo systemctl start mysql`
2. 创建数据库与用户（替换密码）：
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS intelligent_community CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
   mysql -u root -p -e "CREATE USER IF NOT EXISTS 'ic_user'@'localhost' IDENTIFIED BY 'StrongP@ssw0rd'; GRANT ALL PRIVILEGES ON intelligent_community.* TO 'ic_user'@'localhost'; FLUSH PRIVILEGES;"
   ```
3. 导入 init.sql：
   ```bash
   mysql -u ic_user -p intelligent_community < database/init.sql
   ```

   - 若用 root 导入也可：`mysql -u root -p intelligent_community < database/init.sql`
   - 若报错，请把错误信息复制出来供排查。

C. Docker（无需本机安装 MySQL）

1. 确认已安装 Docker 与 docker-compose。
2. 在项目根确保 `docker-compose.yml` 与 `.env.docker` 配置正确，运行：
   ```bash
   docker-compose up --build -d
   ```
3. 首次启动时，MySQL 容器会自动执行 `./database` 下的初始化脚本（挂载到 `/docker-entrypoint-initdb.d`）。
4. 若数据库已存在或未自动导入，可执行：
   ```bash
   chmod +x scripts/init_db.sh
   ./scripts/init_db.sh
   ```

常见问题与快速排查

- 连接被拒绝（Can't connect / 2002）：确认 MySQL 已启动并监听 TCP。尝试：
  - `mysql -h 127.0.0.1 -P 3306 -u root -p`
  - 在 Navicat 用 Host 写 127.0.0.1（不要用 localhost 以避免 socket 问题）。
- 认证失败（Access denied 1045）：密码或用户/host 不匹配。用 root 登录后执行创建用户与授权 SQL。
- MySQL8 授权/插件问题：若提示 plugin 错误，执行：
  ```sql
  ALTER USER 'ic_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'StrongP@ssw0rd';
  FLUSH PRIVILEGES;
  ```
- init.sql 报 ALTER/ENUM 错误：按错误信息在 Navicat 或 CLI 中逐条调整 ALTER 语句（删除不兼容的 IF NOT EXISTS 用法或手动添加列/索引）。

部署后检验（必做）

1. 设置项目 .env（示例）：
   ```
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=ic_user
   DB_PASSWORD=StrongP@ssw0rd
   DB_DATABASE=intelligent_community
   JWT_SECRET=替换为你自己的密钥
   PUBLIC_BASE_URL=http://localhost:3000
   ```
2. 安装依赖并启动后端：
   ```bash
   npm install
   npm start
   ```
3. 健康检查：
   ```bash
   curl http://localhost:3000/health
   # 期望返回 {"ok":true}
   ```

需要我做的下一步（选一项）

- 生成一个 Navicat 兼容的 SQL（注释掉潜在不兼容 ALTER）并上传；
- 帮你分析并修复 init.sql 在你 MySQL 版本上的具体报错（把错误粘上来）；
- 或者我生成一键在本机执行的 shell 脚本来创建用户和导入 SQL。
