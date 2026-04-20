// 数据层：封装 SQL，controller 只调用 service，不直接碰 db
// DB 中 image_urls 存相对路径（/uploads/xxx.png），响应时由 baseUrl 动态拼成绝对 URL
const fs = require('fs');
const path = require('path');
const db = require('../db');
const config = require('../config');
const { toAbsoluteUrl } = require('../utils/baseUrl');

// 上传文件 → 相对路径（存 DB 用）
function fileToRelativePath(file) {
  return `/uploads/${file.filename}`;
}

function create({ title, content, files }, baseUrl) {
  const paths = (files || []).map(fileToRelativePath);
  const stmt = db.prepare(`
    INSERT INTO meal_record (title, content, image_urls)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    title || null,
    content || null,
    JSON.stringify(paths)
  );
  return findById(result.lastInsertRowid, baseUrl);
}

function findById(id, baseUrl) {
  const row = db.prepare(`SELECT * FROM meal_record WHERE id = ?`).get(id);
  return row ? hydrate(row, baseUrl) : null;
}

function list({ page = 1, pageSize = 10 }, baseUrl) {
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 10));
  const offset = (p - 1) * ps;

  const rows = db
    .prepare(
      `SELECT * FROM meal_record
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`
    )
    .all(ps, offset);

  const total = db.prepare(`SELECT COUNT(*) AS c FROM meal_record`).get().c;

  return {
    list: rows.map((r) => hydrate(r, baseUrl)),
    page: p,
    pageSize: ps,
    total,
    totalPages: Math.ceil(total / ps),
  };
}

// 删除记录，并尝试清理本地图片文件
// 上云换对象存储时，这里把本地 unlink 替换成对应 SDK 的 delete 即可
function remove(id) {
  const row = db.prepare(`SELECT * FROM meal_record WHERE id = ?`).get(id);
  if (!row) return false;

  db.prepare(`DELETE FROM meal_record WHERE id = ?`).run(id);

  let urlsOrPaths = [];
  try {
    urlsOrPaths = JSON.parse(row.image_urls || '[]');
  } catch (_e) {
    urlsOrPaths = [];
  }

  for (const item of urlsOrPaths) {
    // 不论存的是相对路径还是遗留的绝对 URL，取 basename 即为文件名
    const filename = path.basename(item);
    const filePath = path.join(config.uploadDir, filename);
    if (path.dirname(filePath) !== config.uploadDir) continue;
    fs.promises.unlink(filePath).catch((err) => {
      if (err.code !== 'ENOENT') {
        console.warn('[meal.remove] unlink failed:', filePath, err.message);
      }
    });
  }

  return true;
}

// DB 行 → API 输出
// image_urls：JSON 字符串 → 数组 → 每项补成当前环境的绝对 URL
function hydrate(row, baseUrl) {
  let items = [];
  try {
    items = JSON.parse(row.image_urls || '[]');
  } catch (_e) {
    items = [];
  }
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    image_urls: items.map((x) => toAbsoluteUrl(x, baseUrl)),
    created_at: row.created_at,
  };
}

module.exports = { create, list, findById, remove };
