const db = require('../db');

function createError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function extractTitle(content) {
  const text = String(content || '').replace(/<[^>]*>/g, '').trim();
  return text.slice(0, 30) || '新建备忘录';
}

function selectNoteSql(where = '') {
  return `
    SELECT
      note.id,
      note.title,
      note.content,
      note.folder_id,
      folder.name AS folder_name,
      note.created_at,
      note.updated_at
    FROM note
    LEFT JOIN folder ON folder.id = note.folder_id
    ${where}
    ORDER BY note.updated_at DESC, note.id DESC
  `;
}

function normalizeFolderId(folderId) {
  if (folderId == null || folderId === '') return null;

  const n = Number(folderId);
  if (!Number.isInteger(n) || n <= 0) {
    throw createError('分类 id 非法', 400);
  }

  const folder = db.prepare(`SELECT id FROM folder WHERE id = ?`).get(n);
  if (!folder) throw createError('分类不存在', 404);
  return n;
}

function list(options = {}) {
  let rows;

  if (options.folderId === 'uncategorized') {
    rows = db.prepare(selectNoteSql('WHERE note.folder_id IS NULL')).all();
  } else if (options.folderId != null && options.folderId !== '') {
    const folderId = normalizeFolderId(options.folderId);
    rows = db.prepare(selectNoteSql('WHERE note.folder_id = ?')).all(folderId);
  } else {
    rows = db.prepare(selectNoteSql()).all();
  }

  return rows.map(hydrate);
}

function findById(id) {
  const row = db.prepare(`
    SELECT
      note.id,
      note.title,
      note.content,
      note.folder_id,
      folder.name AS folder_name,
      note.created_at,
      note.updated_at
    FROM note
    LEFT JOIN folder ON folder.id = note.folder_id
    WHERE note.id = ?
  `).get(id);
  return row ? hydrate(row) : null;
}

function create(content, folderId = null) {
  const normalizedFolderId = normalizeFolderId(folderId);
  const title = extractTitle(content || '');
  const stmt = db.prepare(`
    INSERT INTO note (title, content, folder_id)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(title, content || '', normalizedFolderId);
  return findById(result.lastInsertRowid);
}

function update(id, content, folderId, hasFolderChange = false) {
  const row = db.prepare(`SELECT * FROM note WHERE id = ?`).get(id);
  if (!row) return null;

  const title = extractTitle(content != null ? content : row.content);
  const nextContent = content != null ? content : row.content;
  const nextFolderId = hasFolderChange ? normalizeFolderId(folderId) : row.folder_id;

  db.prepare(`
    UPDATE note
    SET title = ?, content = ?, folder_id = ?, updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(title, nextContent, nextFolderId, id);
  return findById(id);
}

function remove(id) {
  const result = db.prepare(`DELETE FROM note WHERE id = ?`).run(id);
  return result.changes > 0;
}

function hydrate(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    folder_id: row.folder_id == null ? null : row.folder_id,
    folder_name: row.folder_name || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

module.exports = { list, findById, create, update, remove };
