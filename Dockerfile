FROM node:18-alpine

# 安装构建依赖（用于 sharp 等 native 模块），可按需精简
RUN apk add --no-cache python3 make g++ libc6-compat && \
    npm config set unsafe-perm true

WORKDIR /usr/src/app

# 先复制 package.json 以便利用缓存安装依赖
COPY package.json package-lock.json* ./ 

# 如果有 package-lock.json 用 npm ci，否则 npm install
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# 复制应用代码
COPY . .

# 确保上传与数据目录存在并权限合适
RUN mkdir -p /usr/src/app/uploads /usr/src/app/data && \
    chown -R node:node /usr/src/app/uploads /usr/src/app/data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
