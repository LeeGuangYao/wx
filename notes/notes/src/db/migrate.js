const db = require('./index');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS note (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL DEFAULT '',
      content     TEXT NOT NULL DEFAULT '',
      created_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_note_updated_at
      ON note (updated_at DESC);
  `);
  console.log('[migrate] note table ready');
}

migrate();

if (require.main === module) {
  process.exit(0);
}

module.exports = migrate;
