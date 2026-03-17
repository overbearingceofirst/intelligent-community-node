const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { success, error: respError } = require("../utils/response");

function getBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

async function makeThumbnail(filePath) {
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ext);
  const thumbName = `${base}-thumb${ext}`;
  const thumbPath = path.join(dir, thumbName);
  try {
    await sharp(filePath).resize(200, 200, { fit: "cover" }).toFile(thumbPath);
    return thumbPath;
  } catch (err) {
    console.error("makeThumbnail error", err);
    return null;
  }
}

async function uploadFile(req, res, next) {
  try {
    if (!req.file) return respError(res, "no_file", 400);
    const filePath = req.file.path.replace(/\\/g, "/"); // windows friendly

    // 只对图片生成缩略图
    let thumbUrl = null;
    try {
      const thumbPath = await makeThumbnail(req.file.path);
      if (thumbPath) {
        const thumbPublicPath = thumbPath
          .replace(/\\/g, "/")
          .split("/uploads")
          .pop();
        thumbUrl = `${getBaseUrl(req)}/uploads${thumbPublicPath}`;
      }
    } catch (e) {
      console.error("thumbnail generation failed", e);
    }

    const uploadsIndex = filePath.indexOf("/uploads/");
    const publicPath =
      uploadsIndex >= 0
        ? filePath.slice(uploadsIndex)
        : `/uploads/${path.basename(filePath)}`;
    const url = `${getBaseUrl(req)}${publicPath}`;
    return success(res, {
      url,
      thumb: thumbUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
}

async function uploadMultiple(req, res, next) {
  try {
    if (!req.files || !req.files.length) return respError(res, "no_files", 400);
    const base = getBaseUrl(req);
    const files = [];
    for (const f of req.files) {
      const filePath = f.path.replace(/\\/g, "/");
      // 生成缩略图
      let thumbUrl = null;
      try {
        const thumbPath = await makeThumbnail(f.path);
        if (thumbPath) {
          const thumbPublicPath = thumbPath
            .replace(/\\/g, "/")
            .split("/uploads")
            .pop();
          thumbUrl = `${base}/uploads${thumbPublicPath}`;
        }
      } catch (e) {
        console.error("thumb error", e);
      }

      const uploadsIndex = filePath.indexOf("/uploads/");
      const publicPath =
        uploadsIndex >= 0
          ? filePath.slice(uploadsIndex)
          : `/uploads/${f.filename}`;
      files.push({
        url: `${base}${publicPath}`,
        thumb: thumbUrl,
        filename: f.filename,
        size: f.size,
      });
    }
    return success(res, { files });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadFile, uploadMultiple };
