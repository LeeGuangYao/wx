const db = require('./index');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meal_record (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT,
      content     TEXT,
      image_urls  TEXT NOT NULL DEFAULT '[]',
      openid      TEXT,
      created_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_meal_created_at
      ON meal_record (created_at DESC);
  `);

  const cols = db.prepare("PRAGMA table_info(meal_record)").all();
  const hasOpenid = cols.some((c) => c.name === 'openid');
  if (!hasOpenid) {
    db.exec(`ALTER TABLE meal_record ADD COLUMN openid TEXT`);
    console.log('[migrate] added openid column to meal_record');
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_meal_openid
      ON meal_record (openid);

    CREATE TABLE IF NOT EXISTS user (
      openid       TEXT PRIMARY KEY,
      first_login  DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
      last_login   DATETIME NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  const config = require('../config');
  const firstAdmin = config.adminOpenids[0];
  if (firstAdmin) {
    const r = db.prepare(`UPDATE meal_record SET openid = ? WHERE openid IS NULL`).run(firstAdmin);
    if (r.changes > 0) {
      console.log(`[migrate] assigned ${r.changes} orphan records to admin openid`);
    }
  }

  console.log('[migrate] meal_record table ready');
}

migrate();

if (require.main === module) {
  process.exit(0);
}

module.exports = migrate;
