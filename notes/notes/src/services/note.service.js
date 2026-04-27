const db = require('../db');

function extractTitle(content) {
  const text = content.replace(/<[^>]*>/g, '').trim();
  return text.slice(0, 30) || '新建备忘录';
}

function list() {
  const rows = db.prepare(
    `SELECT * FROM note ORDER BY updated_at DESC, id DESC`
  ).all();
  return rows.map(hydrate);
}

function findById(id) {
  const row = db.prepare(`SELECT * FROM note WHERE id = ?`).get(id);
  return row ? hydrate(row) : null;
}

function create(content) {
  const title = extractTitle(content || '');
  const stmt = db.prepare(`
    INSERT INTO note (title, content)
    VALUES (?, ?)
  `);
  const result = stmt.run(title, content || '');
  return findById(result.lastInsertRowid);
}

function update(id, content) {
  const row = db.prepare(`SELECT * FROM note WHERE id = ?`).get(id);
  if (!row) return null;

  const title = extractTitle(content != null ? content : row.content);
  db.prepare(`
    UPDATE note SET title = ?, content = ?, updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(title, content != null ? content : row.content, id);
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
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

module.exports = { list, findById, create, update, remove };
