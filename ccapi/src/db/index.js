// SQLite 连接（单例），使用 better-sqlite3 同步 API，性能与易用性兼得
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// 确保数据库目录存在
fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);

// 开启 WAL，提升并发读性能
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
