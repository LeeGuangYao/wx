// 统一读取环境变量，集中管理配置，便于上云时替换
require('dotenv').config();

const path = require('path');

const config = {
  port: Number(process.env.PORT) || 3000,
  // 可选：当需要固定域名（例如 CDN / 反代域名）时配置，否则留空
  // 留空时 URL 会根据请求的 host 动态拼接，适配多环境
  baseUrl: (process.env.BASE_URL || '').replace(/\/$/, ''),
  dbPath: path.resolve(process.env.DB_PATH || './data/meal.db'),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  maxFiles: Number(process.env.MAX_FILES) || 9,
};

module.exports = config;
