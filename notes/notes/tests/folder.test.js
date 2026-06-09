const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-folder-test-'));

process.env.DB_PATH = path.join(tempDir, 'notes.db');
process.env.NOTES_AUTH_ENABLED = 'true';
process.env.NOTES_AUTH_USERNAME = 'owner';
process.env.NOTES_AUTH_PASSWORD = 'secret-password';
process.env.NOTES_SESSION_SECRET = 'test-session-secret-at-least-32-chars';
process.env.NOTES_SESSION_DAYS = '30';

const migrate = require('../src/db/migrate');
const app = require('../src/app');

let server;
let baseUrl;
let cookie;

async function request(pathname, options = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });
  const json = await res.json();
  return { res, json };
}

async function login() {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'owner', password: 'secret-password' }),
  });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.code, 0);
  cookie = res.headers.get('set-cookie').split(';')[0];
}

before(async () => {
  migrate();
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  await login();
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('creates folders, filters notes by folder, moves notes, and clears deleted folders', async () => {
  const initialFolders = await request('/api/folders');
  assert.equal(initialFolders.res.status, 200);
  assert.equal(initialFolders.json.code, 0);
  assert.deepEqual(initialFolders.json.data, []);

  const workFolder = await request('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '工作' }),
  });

  assert.equal(workFolder.res.status, 200);
  assert.equal(workFolder.json.code, 0);
  assert.equal(workFolder.json.data.name, '工作');
  assert.equal(workFolder.json.data.note_count, 0);

  const note = await request('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '<p>腾讯云相关</p>',
      folder_id: workFolder.json.data.id,
    }),
  });

  assert.equal(note.res.status, 200);
  assert.equal(note.json.code, 0);
  assert.equal(note.json.data.folder_id, workFolder.json.data.id);
  assert.equal(note.json.data.folder_name, '工作');

  const workNotes = await request(`/api/notes?folderId=${workFolder.json.data.id}`);
  assert.equal(workNotes.res.status, 200);
  assert.equal(workNotes.json.code, 0);
  assert.deepEqual(workNotes.json.data.map((item) => item.id), [note.json.data.id]);

  const foldersWithCounts = await request('/api/folders');
  assert.equal(foldersWithCounts.json.data[0].note_count, 1);

  const personalFolder = await request('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '个人' }),
  });

  const moved = await request(`/api/notes/${note.json.data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '<p>腾讯云相关</p>',
      folder_id: personalFolder.json.data.id,
    }),
  });

  assert.equal(moved.res.status, 200);
  assert.equal(moved.json.code, 0);
  assert.equal(moved.json.data.folder_id, personalFolder.json.data.id);
  assert.equal(moved.json.data.folder_name, '个人');

  const deleteFolder = await request(`/api/folders/${personalFolder.json.data.id}`, {
    method: 'DELETE',
  });

  assert.equal(deleteFolder.res.status, 200);
  assert.equal(deleteFolder.json.code, 0);

  const uncategorizedNotes = await request('/api/notes?folderId=uncategorized');
  assert.equal(uncategorizedNotes.res.status, 200);
  assert.equal(uncategorizedNotes.json.code, 0);
  assert.equal(uncategorizedNotes.json.data[0].id, note.json.data.id);
  assert.equal(uncategorizedNotes.json.data[0].folder_id, null);
  assert.equal(uncategorizedNotes.json.data[0].folder_name, null);
});
