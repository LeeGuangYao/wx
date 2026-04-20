// 数据层：封装 SQL，controller 只调用 service，不直接碰 db
const fs = require('fs');
const path = require('path');
const db = require('../db');
const config = require('../config');

// 把上传的文件转成对外可访问的 URL
function fileToUrl(file) {
  return `${config.baseUrl}/uploads/${file.filename}`;
}

function create({ title, content, files }) {
  const imageUrls = (files || []).map(fileToUrl);
  const stmt = db.prepare(`
    INSERT INTO meal_record (title, content, image_urls)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    title || null,
    content || null,
    JSON.stringify(imageUrls)
  );
  return findById(result.lastInsertRowid);
}

function findById(id) {
  const row = db
    .prepare(`SELECT * FROM meal_record WHERE id = ?`)
    .get(id);
  return row ? hydrate(row) : null;
}

function list({ page = 1, pageSize = 10 }) {
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

  const total = db
    .prepare(`SELECT COUNT(*) AS c FROM meal_record`)
    .get().c;

  return {
    list: rows.map(hydrate),
    page: p,
    pageSize: ps,
    total,
    totalPages: Math.ceil(total / ps),
  };
}

// 把 DB 行转成 API 输出：image_urls 从 JSON 字符串解析回数组
function hydrate(row) {
  let imageUrls = [];
  try {
    imageUrls = JSON.parse(row.image_urls || '[]');
  } catch (_e) {
    imageUrls = [];
  }
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    image_urls: imageUrls,
    created_at: row.created_at,
  };
}

// 删除记录，并尝试清理本地图片文件
// 上云换对象存储时，这里把本地 unlink 替换成对应 SDK 的 delete 即可
function remove(id) {
  const row = db.prepare(`SELECT * FROM meal_record WHERE id = ?`).get(id);
  if (!row) return false;

  db.prepare(`DELETE FROM meal_record WHERE id = ?`).run(id);

  let urls = [];
  try {
    urls = JSON.parse(row.image_urls || '[]');
  } catch (_e) {
    urls = [];
  }

  for (const url of urls) {
    const filename = path.basename(url);
    const filePath = path.join(config.uploadDir, filename);
    // 防御：只删 uploads 目录下的文件，避免路径穿越
    if (path.dirname(filePath) !== config.uploadDir) continue;
    fs.promises.unlink(filePath).catch((err) => {
      if (err.code !== 'ENOENT') console.warn('[meal.remove] unlink failed:', filePath, err.message);
    });
  }

  return true;
}

module.exports = { create, list, findById, remove };
