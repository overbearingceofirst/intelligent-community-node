# intelligent-community-node — 接口文档（简明）

说明：所有受保护接口需要在 Header 中携带 Authorization: Bearer <token>。返回格式常见为 JSON，错误格式：{ "error": "message" }。列表分页接口统一返回 { page, limit, total, data }。

基础

- 健康检查
  - GET /health
  - 响应：{ "ok": true }

认证（Auth）

- POST /api/auth/register
  - 描述：用户名/密码注册
  - Body JSON: { "username": "string", "password": "string", "name": "string (optional)" }
  - 响应：{ id, username }

- POST /api/auth/login
  - 描述：用户名/密码登录
  - Body JSON: { "username": "string", "password": "string" }
  - 响应：{ token }

- GET /api/auth/me
  - 描述：获取当前登录用户信息
  - Header: Authorization: Bearer <token>
  - 响应：user 对象（含档案字段）

- PUT /api/auth/profile
  - 描述：更新用户档案
  - Header: Authorization: Bearer <token>
  - Body JSON（示例字段）：{ "full_name","community","room","gender","resident_type","id_card","passport","domicile","employer","notes","face_image" }
  - 响应：{ ok: true }

- POST /api/auth/bind-house
  - 描述：绑定房屋
  - Header: Authorization: Bearer <token>
  - Body: { "house_id": number }
  - 响应：{ ok: true }

用户（Users）

- GET /api/users/profile
  - 描述：获取当前用户资料（与 /api/auth/me 类似）
  - Header: Authorization: Bearer <token>

- GET /api/users
  - 描述：管理员/物业列出用户（分页）
  - Header: Authorization: Bearer <token>（role=admin 或 manager）
  - Query: ?page=1&limit=20
  - 响应：{ page, limit, total, data: [ { id, username, name, role, points } ] }

- POST /api/users/:id/role
  - 描述：管理员变更用户角色
  - Header: Authorization: Bearer <token>（admin）
  - Body: { "role": "resident|manager|admin" }
  - 响应：{ ok: true }

文件上传（Uploads）

- POST /api/uploads
  - 描述：单文件上传（需登录）
  - Header: Authorization: Bearer <token>
  - Content-Type: multipart/form-data
  - Form fields: file (文件), optional type (face/repair/visitor/common)
  - 响应：{ ok: true, url: "<public url>", thumb: "<thumb url or null>", filename, size }

- POST /api/uploads/multiple
  - 描述：多文件上传（字段名 files[]）
  - Header: Authorization: Bearer <token>
  - 响应：{ ok: true, files: [{ url, thumb, filename, size }] }

静态资源

- 上传文件可通过 /uploads/<type>/<filename> 访问（PUBLIC_BASE_URL + 返回的路径）

报修（Repairs）

- POST /api/repairs
  - 描述：居民提交报修
  - Header: Authorization: Bearer <token>
  - Body JSON: { "house_id": number (opt), "title": string, "description": string }
  - 响应：{ id }

- GET /api/repairs
  - 描述：列表（居民查看自己，管理员查看全部）
  - Header: Authorization: Bearer <token>
  - Query: ?page=1&limit=20&status=&house_id=
  - 响应：{ page, limit, total, data: [ {...} ] }

- GET /api/repairs/:id
  - 描述：详情含日志
  - Header: Authorization: Bearer <token>
  - 响应：{ repair fields, logs: [...] }

- PUT /api/repairs/:id
  - 描述：更新（管理员可改状态/字段；居民在 submitted 阶段可修改内容）
  - Header: Authorization: Bearer <token>
  - Body: { title?, description?, status? }
  - 响应：{ ok: true }

- POST /api/repairs/:id/logs
  - 描述：添加日志/备注
  - Header: Authorization: Bearer <token>
  - Body: { action: string, note?: string }
  - 响应：{ ok: true }

- POST /api/repairs/:id/assign
  - 描述：管理端指派工单（admin/manager）
  - Header: Authorization: Bearer <token>
  - Body: { assignee_id: number }
  - 响应：{ ok: true }

- POST /api/repairs/:id/status
  - 描述：独立状态变更接口（管理员/assignee 或用户取消）
  - Header: Authorization: Bearer <token>
  - Body: { status: 'submitted'|'accepted'|'processing'|'completed'|'cancelled' }
  - 响应：{ ok: true }

访客（Visitors）

- POST /api/visitors
  - 描述：居民创建访客预约（无需审批，系统自动确认）
  - Header: Authorization: Bearer <token>
  - Body JSON: { "visitor_name": string, "visit_time": ISO8601 string, "visitor_phone"?: string, "house_id"?: number, "note"?: string, "expiresDays"?: number }
  - 响应：{ id, qr: "<dataURL>", verify_url: "<url>", expires_at }

- GET /api/visitors
  - 描述：列表（page/limit/status）
  - Header: Authorization: Bearer <token>
  - Query: ?page=1&limit=20&status=
  - 响应：{ page, limit, total, data: [...] }

- GET /api/visitors/:id
  - 描述：详情（含日志）
  - Header: Authorization: Bearer <token>

- GET /api/visitors/verify/public/:token
  - 描述：公共扫码核验页面（物业扫码即可核销并返回成功/失败 HTML）
  - 响应：HTML 页面（核验结果）

积分与兑换（Points）

- GET /api/points/balance
  - 描述：查看当前积分余额
  - Header: Authorization: Bearer <token>
  - 响应：{ points: number }

- GET /api/points/transactions
  - 描述：积分流水（分页可选）
  - Header: Authorization: Bearer <token>
  - Query: ?limit=100
  - 响应：[{ id, change, type, note, related_id, created_at }]

- GET /api/points/rewards
  - 描述：查看可兑换商品（公开）
  - Header: Authorization: Bearer <token>

- POST /api/points/redeem
  - 描述：兑换商品（生成兑换二维码，status=pending）
  - Header: Authorization: Bearer <token>
  - Body: { reward_id: number }
  - 响应：{ ok: true, redemption_id, qr: "<dataURL>", verify_url, expires_at }

- GET /api/points/redemptions/verify/public/:token
  - 描述：扫码直接调用公共核销页面完成核销并返回 HTML 成功/失败页面

- POST /api/points/redemptions/verify
  - 描述：管理员后台核销（auth admin/manager）
  - Header: Authorization: Bearer <token>
  - Body: { token: string }
  - 响应：{ ok: true }

管理端（Points 管理）

- POST /api/points/rewards
  - 描述：创建奖励（admin/manager）
  - Body: { title, description?, cost_points, stock }

- PUT /api/points/rewards/:id
  - 描述：更新奖励（admin/manager）

- POST /api/points/adjust
  - 描述：管理员调整用户积分（admin/manager）
  - Body: { user_id, change, note? }

通知（Notifications）

- GET /api/notifications
  - 描述：拉取当前用户通知（分页）
  - Header: Authorization: Bearer <token>
  - Query: ?page=1&limit=20&unread=1
  - 响应：{ page, limit, total, data: [ { id, title, body, meta, read, created_at } ] }

- POST /api/notifications/:id/read
  - 描述：标记为已读
  - Header: Authorization: Bearer <token>
  - 响应：{ ok: true }

## 互助需求（Help posts）

- POST /api/help
  - 描述：发布互助需求（填写表单，提交后进入待审核状态 pending）
  - Header: Authorization: Bearer <token>
  - Body JSON:
    {
    "title": "string (必填)",
    "content": "string (可选)",
    "images": ["https://.../img1.jpg", "..."],
    "anonymous": true|false,
    "reward": "string (可选)"
    }
  - 响应：{ "id": number, "status": "pending" }

- 管理端审核（示例）
  - POST /api/help/:id/approve // admin/manager 审核通过
  - POST /api/help/:id/reject // admin/manager 驳回，Body: { reason: "说明" }

示例：管理员通过互助帖
curl -X POST http://localhost:3000/api/help/123/approve \
 -H "Authorization: Bearer <ADMIN_TOKEN>"

示例：管理员驳回并填写原因
curl -X POST http://localhost:3000/api/help/123/reject \
 -H "Authorization: Bearer <ADMIN_TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"reason":"不符合社区规范"}'

- GET /api/help
  - 描述：互助列表（分页、搜索、按状态过滤）
  - Header: Authorization: Bearer <token>
  - Query: ?page=1&limit=20&status=open|closed&q=关键词
  - 响应：{ page, limit, total, data: [{ id, title, content, images, anonymous, reward, status, created_at, updated_at, user_id|null }] }
    - 注：anonymous 为 true 时返回的 user_id 为 null（前端不显示作者信息）

- GET /api/help/:id
  - 描述：获取互助详情
  - Header: Authorization: Bearer <token>
  - 响应：
    {
    id, title, content, images, anonymous, reward, status, created_at, updated_at,
    author: null 或 { id, username, name }
    }

- PUT /api/help/:id
  - 描述：更新互助（发帖人或 admin/manager）
  - Header: Authorization: Bearer <token>
  - Body JSON: 可包含 title/content/images/anonymous/reward/status
  - 响应：{ ok: true }

- DELETE /api/help/:id
  - 描述：删除互助（发帖人或 admin/manager）
  - Header: Authorization: Bearer <token>
  - 响应：{ ok: true }

- POST /api/help/:id/close
  - 描述：关闭互助（发帖人或 admin/manager，将 status 置为 closed）
  - Header: Authorization: Bearer <token>
  - 响应：{ ok: true }

示例：发布互助（先上传图片再发布）

1. 上传图片：
   curl -X POST http://localhost:3000/api/uploads \
    -H "Authorization: Bearer <TOKEN>" \
    -F "type=common" -F "file=@/path/to/img.jpg"
   -> 返回 { url: "https://.../uploads/common/xxx.jpg", thumb: "..." }

2. 发布互助：
   curl -X POST http://localhost:3000/api/help \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"title":"帮忙代购牛奶","content":"急需，楼下无人代购","images":["https://.../uploads/common/xxx.jpg"],"anonymous":false,"reward":"100积分"}'

错误码与返回（简要）

- 400 validation_error：请求参数不合规，details 提供字段错误数组
- 401 Unauthorized：未授权或 token 无效
- 403 Forbidden：权限不足
- 404 not_found：资源不存在
- 500 Internal Server Error：服务器异常

备注

- 二维码流程：兑换/访客创建接口均返回 qr (dataURL) 与 verify_url（推荐前端直接弹窗显示 dataURL；物业扫码会打开 verify_url 并得到成功/失败页面）。
- 上传文件通过 /uploads 静态访问（PUBLIC_BASE_URL + path），缩略图返回字段 thumb。
- 分页接口统一返回 { page, limit, total, data }，若需要额外排序/筛选/总页数可在前端计算或后端扩展。

若需要，我可以：

- 生成 OpenAPI (YAML/JSON) 文档或 Postman 集合；
- 为特定接口补充更详细的请求/响应示例（字段定义与类型）；
- 根据前端需求添加更多校验与示例。
