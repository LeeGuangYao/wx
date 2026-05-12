const db = require('../db');
const config = require('../config');

function upsert(openid) {
  db.prepare(`
    INSERT INTO user (openid, first_login, last_login)
    VALUES (?, datetime('now','localtime'), datetime('now','localtime'))
    ON CONFLICT(openid) DO UPDATE SET
      last_login = datetime('now','localtime')
  `).run(openid);
}

function listAll() {
  const rows = db.prepare(`
    SELECT openid, first_login, last_login
    FROM user
    ORDER BY last_login DESC
  `).all();
  return rows.map((r) => ({
    openid: r.openid,
    firstLogin: r.first_login,
    lastLogin: r.last_login,
    isAdmin: config.adminOpenids.includes(r.openid),
  }));
}

module.exports = { upsert, listAll };
