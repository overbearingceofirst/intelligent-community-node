const db = require("../config/db");
require("dotenv").config();
const notificationQueue = require("./notificationQueue");

// 不再使用 SMTP 发送邮件，保留接口为 no-op 以兼容调用方
async function sendEmail(to, subject, text, html) {
  // 邮件功能已禁用（项目配置为仅使用站内通知）
  console.log(
    "sendEmail called but email sending is disabled. to=",
    to,
    "subject=",
    subject,
  );
  return null;
}

async function createNotification(user_id, title, body, meta = null) {
  const metaStr = meta ? JSON.stringify(meta) : null;
  await db.query(
    "INSERT INTO notifications (user_id, title, body, meta) VALUES (?, ?, ?, ?)",
    [user_id, title, body, metaStr],
  );
  return true;
}

// 简单 push stub：当前实现为在通知表中写入记录，未来可集成 FCM/APNs
async function sendPush(user_id, title, body, meta = null) {
  // TODO: fetch push token and call push provider
  await createNotification(user_id, title, body, meta);
  return true;
}

// 高层：通知用户（不再直接写库，而是入队异步处理；同时保留 push stub 写记录的能力）
async function notifyUser(user_id, title, body, meta = null) {
  try {
    // 入队，worker 会调用 createNotification
    notificationQueue.enqueue({ user_id, title, body, meta });
    // 仍返回 true 表示已安排发送
    return true;
  } catch (err) {
    console.error("notifyUser enqueue error", err);
    return false;
  }
}

module.exports = { sendEmail, createNotification, sendPush, notifyUser };
