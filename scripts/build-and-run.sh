#!/usr/bin/env bash
set -euo pipefail

# 一键构建并启动容器，然后初始化数据库（若 scripts/init_db.sh 存在）
# 使用前请确保已配置 .env.docker（或 .env），并已修改敏感配置

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "项目根目录: $ROOT_DIR"

# 检查 docker-compose 文件
if [ ! -f "docker-compose.yml" ]; then
  echo "错误：找不到 docker-compose.yml，请在项目根运行此脚本。"
  exit 1
fi

# 提示 .env.docker
if [ ! -f ".env.docker" ]; then
  echo "警告：未找到 .env.docker。请复制 .env.docker 并修改为你的部署配置，或设置环境变量。"
  echo "示例：cp .env.docker .env.docker.local && 编辑 .env.docker.local"
else
  echo ".env.docker 找到，确保其配置正确（DB 密码、JWT_SECRET 等）"
fi

echo "开始构建并启动容器（此步骤可能需要一些时间）..."
docker-compose up --build -d

# 等待短时间让容器启动
echo "等待服务启动..."
sleep 3

# 如果有初始化脚本则执行（scripts/init_db.sh）
if [ -f "scripts/init_db.sh" ]; then
  echo "执行数据库初始化脚本 scripts/init_db.sh（如需跳过请手动运行 docker-compose 并忽略此步骤）"
  chmod +x scripts/init_db.sh
  ./scripts/init_db.sh
else
  echo "未找到 scripts/init_db.sh，跳过数据库导入（若需要请手动导入 database/init.sql）。"
fi

echo ""
echo "部署完成。检查日志与健康状态："
echo "  docker-compose logs -f app"
echo "  curl http://localhost:3000/health"
echo ""
echo "如需创建管理员，请运行："
echo "  node scripts/createAdmin.js <username> <password> \"显示名\""
