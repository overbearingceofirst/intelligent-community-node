// src/routes/auth.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validate");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);

// 获取当前登录用户信息
router.get("/me", verifyToken, ctrl.me);

// 用户填写/更新个人档案
router.put(
  "/profile",
  verifyToken,
  body("full_name").optional().isString().isLength({ max: 100 }),
  body("gender").optional().isIn(["male", "female", "other"]),
  body("resident_type").optional().isIn(["owner", "tenant", "family", "other"]),
  body("id_card").optional().isString().isLength({ max: 50 }),
  body("passport").optional().isString().isLength({ max: 50 }),
  body("domicile").optional().isString().isLength({ max: 255 }),
  body("employer").optional().isString().isLength({ max: 255 }),
  body("notes").optional().isString().isLength({ max: 1000 }),
  handleValidationErrors,
  ctrl.updateProfile,
);

// 房屋绑定等其他接口
router.post("/bind-house", verifyToken, ctrl.bindHouse);

module.exports = router;
