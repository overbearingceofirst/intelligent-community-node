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
