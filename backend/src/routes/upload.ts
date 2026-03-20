import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middleware/auth";
import { success, error } from "../utils/response";

const router = Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    cb(null, allowed.test(ext));
  },
});

router.use(authMiddleware);

// 单文件上传
router.post("/single", upload.single("file"), (req, res) => {
  if (!req.file) return error(res, "请选择文件", 400);
  return success(res, {
    url: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
    newFileName: req.file.filename,
  });
});

// 多文件上传
router.post("/multiple", upload.array("files", 10), (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) return error(res, "请选择文件", 400);
  const data = files.map((f) => ({
    url: `/uploads/${f.filename}`,
    fileName: f.originalname,
    newFileName: f.filename,
  }));
  return success(res, data);
});

export default router;
