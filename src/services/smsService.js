// SMS 功能已禁用，若调用将返回不可用提示
async function sendCode() {
  return { ok: false, error: "sms_disabled" };
}
async function verifyCode() {
  return { ok: false, error: "sms_disabled" };
}
module.exports = { sendCode, verifyCode };
