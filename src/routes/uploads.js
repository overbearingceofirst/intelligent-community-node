const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/auth");
const ctrl = require("../controllers/uploadsController");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validate");

// storage 根据 req.body.type（如 'face', 'repair', 'visitor'）动态创建子目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = (req.body.type || "common").replace(/[^\w\-]/g, "_");
    const uploadPath = path.join(__dirname, "..", "..", "uploads", type);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.random().toString(36).substr(2, 8)}${ext}`;
    cb(null, name);
  },
});

// fileFilter: 只允许图片（jpeg/png）
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("invalid_file_type"), false);
  }
  cb(null, true);
}

// 限制单文件大小为 5MB（可调整）
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 单文件上传：字段名 file
router.post(
  "/",
  verifyToken,
  body("type").optional().isString().trim().isLength({ max: 50 }),
  handleValidationErrors,
  upload.single("file"),
  ctrl.uploadFile,
);

// 多文件上传：字段名 files
router.post(
  "/multiple",
  verifyToken,
  body("type").optional().isString().trim().isLength({ max: 50 }),
  handleValidationErrors,
  upload.array("files", 20),
  ctrl.uploadMultiple,
);

module.exports = router;
