#!/usr/bin/env bash
# 用法: ./scripts/init_db.sh
set -e
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}
# 读取密码与数据库名
source .env.docker || true
DB_PWD=${DB_PASSWORD:-rootpassword}
DB_NAME=${DB_DATABASE:-intelligent_community}

echo "等待数据库启动..."
# 等待 db 健康
until docker-compose -f $COMPOSE_FILE exec -T db mysqladmin ping -h "127.0.0.1" -p"$DB_PWD" >/dev/null 2>&1; do
  sleep 1
done

echo "导入 database/init.sql 到数据库 ${DB_NAME}"
docker-compose -f $COMPOSE_FILE exec -T db sh -c "mysql -u root -p\"$DB_PWD\" \"$DB_NAME\"" < database/init.sql

echo "导入完成。"
