// 建表脚本，首次启动或 npm run migrate 执行
// 幂等：IF NOT EXISTS，重复执行安全
const db = require('./index');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meal_record (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT,
      content     TEXT,
      image_urls  TEXT NOT NULL DEFAULT '[]',  -- JSON 数组字符串
      created_at  DATETIME NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_meal_created_at
      ON meal_record (created_at DESC);
  `);
  console.log('[migrate] meal_record table ready');
}

migrate();

// 作为脚本单独执行时自动退出
if (require.main === module) {
  process.exit(0);
}

module.exports = migrate;
