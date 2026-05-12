// 统一读取环境变量，集中管理配置，便于上云时替换
require('dotenv').config();

const path = require('path');

const config = {
  port: Number(process.env.PORT) || 3000,
  baseUrl: (process.env.BASE_URL || '').replace(/\/$/, ''),
  dbPath: path.resolve(process.env.DB_PATH || './data/meal.db'),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  maxFiles: Number(process.env.MAX_FILES) || 9,
  wxAppid: process.env.WX_APPID || '',
  wxSecret: process.env.WX_SECRET || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  adminOpenids: (process.env.ADMIN_OPENIDS || '').split(',').map((s) => s.trim()).filter(Boolean),
};

module.exports = config;
