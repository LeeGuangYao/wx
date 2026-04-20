// multer 本地存储；上云时把 storage 换成 S3/OSS/COS 的 multer-* 适配即可
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const config = require('../config');

fs.mkdirSync(config.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // 用 nanoid 避免文件名冲突 / 中文乱码
    cb(null, `${Date.now()}_${nanoid(8)}${ext}`);
  },
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
  cb(new Error('仅支持 jpg/png/gif/webp 图片'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
    files: config.maxFiles,
  },
});

module.exports = upload;
