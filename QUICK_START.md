# 快速启动命令行手册

本文档包含项目启动所需的所有命令，方便下次快速运行。

---

## 一、启动 MySQL 服务

```bash
# macOS (Homebrew)
brew services start mysql

# 查看状态
brew services list

# 重启
brew services restart mysql

# 停止
brew services stop mysql
```

---

## 二、创建数据库

```bash
# 连接 MySQL（输入密码 123456）
mysql -h 127.0.0.1 -P 3306 -u ic_user -p

# 在 mysql 提示符执行：
CREATE DATABASE IF NOT EXISTS intelligent_community CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

# 退出
exit;
```

或者一条命令直接创建：

```bash
mysql -h 127.0.0.1 -P 3306 -u ic_user -p -e "CREATE DATABASE IF NOT EXISTS intelligent_community CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
```

---

## 三、启动后端

```bash
cd backend
npm install          # 首次运行需要安装依赖
npm run dev          # 启动开发服务器（端口 3000）
```

---

## 四、启动前端

```bash
cd frontend
npm install          # 首次运行需要安装依赖
npm run dev          # 启动开发服务器（端口 8080）
```

---

## 五、访问系统

- 前端地址：http://localhost:8080
- 后端地址：http://localhost:3000
- 默认管理员：`admin` / `admin123`

---

## 六、常用排查命令

```bash
# 检查 MySQL 是否在运行
brew services list

# 检查端口占用
lsof -iTCP:3000 -sTCP:LISTEN    # 后端端口
lsof -iTCP:8080 -sTCP:LISTEN    # 前端端口

# 杀掉占用端口的进程
kill <pid>

# 查看后端日志
cd backend && cat logs/combined.log

# 测试数据库连接
mysql -h 127.0.0.1 -P 3306 -u ic_user -p -e "SHOW DATABASES;"
```

---

## 七、一键启动脚本（可选）

在项目根目录创建 `start.sh`：

```bash
#!/bin/bash
# 启动 MySQL
brew services start mysql

# 等待 MySQL 就绪
sleep 2

# 启动后端（后台运行）
cd backend && npm run dev &

# 启动前端
cd ../frontend && npm run dev
```

运行方式：

```bash
chmod +x start.sh
./start.sh
```

---

## 八、停止所有服务

```bash
# 停止 MySQL
brew services stop mysql

# 找到并杀掉 Node 进程
pkill -f "ts-node-dev"
pkill -f "vite"
```

---

## 九、重置数据库（谨慎操作）

```bash
# 删除数据库
mysql -h 127.0.0.1 -P 3306 -u ic_user -p -e "DROP DATABASE intelligent_community;"

# 重新创建
mysql -h 127.0.0.1 -P 3306 -u ic_user -p -e "CREATE DATABASE intelligent_community CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 重启后端（Sequelize 会自动重建表）
cd backend && npm run dev
```

---

## 十、常见问题

| 问题                          | 解决方案                                       |
| ----------------------------- | ---------------------------------------------- |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL 未启动，执行 `brew services start mysql` |
| `Unknown database`            | 数据库未创建，执行第二节命令                   |
| `EADDRINUSE :3000`            | 端口被占用，杀掉占用进程或改端口               |
| `401 Invalid token`           | Token 过期，重新登录获取新 Token               |
| 前端白屏                      | 检查浏览器控制台报错，确认后端已启动           |

---

保存此文档，下次启动只需按顺序执行即可。
