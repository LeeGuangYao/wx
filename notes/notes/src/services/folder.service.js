const db = require('../db');

function createError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normalizeName(name) {
  const value = String(name || '').replace(/\s+/g, ' ').trim();
  if (!value) throw createError('分类名称不能为空', 400);
  if (value.length > 40) throw createError('分类名称不能超过 40 个字符', 400);
  return value;
}

function hydrate(row) {
  return {
    id: row.id,
    name: row.name,
    note_count: Number(row.note_count || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function list() {
  const rows = db.prepare(`
    SELECT
      folder.id,
      folder.name,
      folder.created_at,
      folder.updated_at,
      COUNT(note.id) AS note_count
    FROM folder
    LEFT JOIN note ON note.folder_id = folder.id
    GROUP BY folder.id
    ORDER BY folder.updated_at DESC, folder.id DESC
  `).all();

  return rows.map(hydrate);
}

function findById(id) {
  const row = db.prepare(`
    SELECT
      folder.id,
      folder.name,
      folder.created_at,
      folder.updated_at,
      COUNT(note.id) AS note_count
    FROM folder
    LEFT JOIN note ON note.folder_id = folder.id
    WHERE folder.id = ?
    GROUP BY folder.id
  `).get(id);

  return row ? hydrate(row) : null;
}

function create(name) {
  const normalizedName = normalizeName(name);

  try {
    const result = db.prepare(`
      INSERT INTO folder (name)
      VALUES (?)
    `).run(normalizedName);

    return findById(result.lastInsertRowid);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw createError('分类名称已存在', 409);
    }
    throw err;
  }
}

function update(id, name) {
  const existing = findById(id);
  if (!existing) return null;

  const normalizedName = normalizeName(name);

  try {
    db.prepare(`
      UPDATE folder
      SET name = ?, updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(normalizedName, id);

    return findById(id);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw createError('分类名称已存在', 409);
    }
    throw err;
  }
}

const removeTransaction = db.transaction((id) => {
  const existing = db.prepare(`SELECT id FROM folder WHERE id = ?`).get(id);
  if (!existing) return false;

  db.prepare(`
    UPDATE note
    SET folder_id = NULL, updated_at = datetime('now','localtime')
    WHERE folder_id = ?
  `).run(id);

  db.prepare(`DELETE FROM folder WHERE id = ?`).run(id);
  return true;
});

function remove(id) {
  return removeTransaction(id);
}

module.exports = { list, findById, create, update, remove };
