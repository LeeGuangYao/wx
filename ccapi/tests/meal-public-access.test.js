const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccapi-meal-public-'));
process.env.DB_PATH = path.join(tempDir, 'meal.db');
process.env.UPLOAD_DIR = path.join(tempDir, 'uploads');
process.env.JWT_SECRET = 'test-secret';

fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });

require('../src/db/migrate');

const db = require('../src/db');
const authMiddleware = require('../src/middlewares/auth');
const mealService = require('../src/services/meal.service');

function runAuth(pathname, method = 'GET') {
  return new Promise((resolve) => {
    const req = { path: pathname, method, headers: {} };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ statusCode: this.statusCode, body, nextCalled: false });
      },
    };
    authMiddleware(req, res, () => resolve({ statusCode: 200, nextCalled: true }));
  });
}

function insertMeal(openid, title) {
  return db
    .prepare(
      `INSERT INTO meal_record (title, content, image_urls, openid)
       VALUES (?, ?, ?, ?)`
    )
    .run(title, 'content', JSON.stringify(['/uploads/example.jpg']), openid)
    .lastInsertRowid;
}

(async () => {
  try {
    const ownedId = insertMeal('openid-a', 'owned by a');
    const otherId = insertMeal('openid-b', 'owned by b');

    const listAuth = await runAuth('/api/meal/list');
    assert.equal(listAuth.nextCalled, true, 'GET /api/meal/list should not require auth');

    const detailAuth = await runAuth(`/api/meal/${ownedId}`);
    assert.equal(detailAuth.nextCalled, true, 'GET /api/meal/:id should not require auth');

    const createAuth = await runAuth('/api/meal/create', 'POST');
    assert.equal(createAuth.nextCalled, true, 'POST /api/meal/create should not require auth');

    const deleteAuth = await runAuth(`/api/meal/${ownedId}`, 'DELETE');
    assert.equal(deleteAuth.nextCalled, true, 'DELETE /api/meal/:id should not require auth');

    const list = mealService.list({ page: 1, pageSize: 10 }, 'http://example.test');
    assert.equal(list.total, 2, 'anonymous list should include all meal records');
    assert.deepEqual(
      list.list.map((item) => item.id).sort((a, b) => a - b),
      [ownedId, otherId],
      'anonymous list should not filter by openid'
    );

    const detail = mealService.findById(otherId, 'http://example.test');
    assert.equal(detail.id, otherId, 'anonymous detail should return records from any openid');

    const removed = mealService.remove(otherId);
    assert.equal(removed, true, 'anonymous delete should remove records from any openid');
  } finally {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
})();
