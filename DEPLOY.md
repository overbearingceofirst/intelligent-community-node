# intelligent-community-node 部署说明（简明）

本文档包含开发环境与使用 Docker 容器部署的步骤、初始化数据库、常见问题与生产注意事项。

重要文件

- Dockerfile
- docker-compose.yml
- .env.docker（示例）
- database/init.sql
- scripts/init_db.sh（辅助导入脚本）
- scripts/createAdmin.js（创建管理员账号）

一、准备（本地开发）

1. 复制环境示例并填写真实值：
   cp .env.example .env
   编辑 .env，设置 DB_HOST/DB_USER/DB_PASSWORD/DB_DATABASE、JWT_SECRET 等。

2. 安装依赖并运行：
   npm install
   npm run dev # 开发模式（nodemon）

3. 初始化数据库（若使用本地 MySQL）：
   mysql -u root -p < database/init.sql
   或先创建库再导入：
   mysql -u root -p -e "CREATE DATABASE intelligent_community CHARACTER SET utf8mb4;"
   mysql -u root -p intelligent_community < database/init.sql

二、使用 Docker（推荐用于演示/开发一致性）

1. 复制并编辑 docker 环境文件：
   cp .env.docker .env.docker.local
   编辑 .env.docker.local，设置 DB 密码、JWT_SECRET、PUBLIC_BASE_URL 等。

2. 构建并启动容器：
   docker-compose up --build -d

   说明：
   - 第一次启动时，docker-compose 已把 ./database 挂载到 db 容器的 /docker-entrypoint-initdb.d，MySQL 镜像会在初始化阶段自动执行 init.sql。
   - 若数据库已存在，请不要重复挂载 init 脚本，改用 scripts/init_db.sh 手动导入。

3. 若需要手动导入（数据库已启动且未执行 init.sql）：
   chmod +x scripts/init_db.sh
   ./scripts/init_db.sh

三、验证服务

1. 健康检查：
   curl http://localhost:3000/health
   应返回：{"ok":true}

2. 注册/登录（示例）：
   curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"test","password":"pass"}'
   curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"test","password":"pass"}'

3. 创建管理员（在容器内或本地 Node 运行脚本）：
   node scripts/createAdmin.js admin1 StrongP@ss "系统管理员"

四、常见问题与排查

- 容器无法连接数据库：
  - 检查 .env.docker 中 DB_HOST 是否为 `db`（docker-compose 服务名）。
  - 检查 db 容器日志：docker logs ic_db
  - 确认 db 容器健康（docker ps / docker inspect）。

- MySQL 自动执行 init.sql 失败：
  - 如果数据库已存在则 entrypoint 不会再执行 /docker-entrypoint-initdb.d 下脚本。
  - 可使用 scripts/init_db.sh 手动导入。

- sharp 编译或二进制错误（本地开发）：
  - 在 macOS：xcode-select --install
  - 或运行：npm rebuild sharp

五、生产注意事项（简短）

1. 不要在生产中使用 .env.docker 默认密码，使用安全 secret 管理。
2. 使用真实的持久化卷与备份策略（MySQL 备份）。
3. 推荐在前端/代理（Nginx）处理 HTTPS 与负载均衡，后端只监听本地端口。
4. 将内存队列替换为 Redis 或其他可靠队列以防丢失通知。
5. 启用日志收集与监控（如 Prometheus、Sentry）。

六、常用 Docker 命令

- 查看日志：docker-compose logs -f app
- 停止服务：docker-compose down
- 重新构建：docker-compose up --build -d
- 进入容器：docker-compose exec app sh

结束语

- 若需要我把部署流程写成一键脚本（build-and-run.sh）或生成 Kubernetes 清单（Deployment/Service/Ingress），告知要支持的目标平台（Docker Compose / k8s），我会继续补充。
