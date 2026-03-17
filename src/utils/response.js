function success(res, data = null) {
  return res.status(200).json({ code: 200, msg: "操作成功", data });
}

function error(res, msg = "操作失败", status = 500) {
  return res.status(status).json({ code: status, msg });
}

module.exports = { success, error };
