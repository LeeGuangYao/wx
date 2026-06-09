const db = require('./index');

function hasColumn(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all()
    .some((column) => column.name === columnName);
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS folder (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      created_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS note (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL DEFAULT '',
      content     TEXT NOT NULL DEFAULT '',
      folder_id   INTEGER DEFAULT NULL REFERENCES folder(id) ON DELETE SET NULL,
      created_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  if (!hasColumn('note', 'folder_id')) {
    db.exec(`ALTER TABLE note ADD COLUMN folder_id INTEGER DEFAULT NULL REFERENCES folder(id) ON DELETE SET NULL;`);
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_note_updated_at
      ON note (updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_note_folder_id
      ON note (folder_id);

    CREATE INDEX IF NOT EXISTS idx_folder_updated_at
      ON folder (updated_at DESC, id DESC);
  `);
  console.log('[migrate] note and folder tables ready');
}

migrate();

if (require.main === module) {
  process.exit(0);
}

module.exports = migrate;
