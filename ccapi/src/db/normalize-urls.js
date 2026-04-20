// 一次性维护脚本：把 image_urls 里历史遗留的绝对 URL 规范化为相对路径
// 使用：node src/db/normalize-urls.js
const db = require('./index');

function normalize(item) {
  if (typeof item !== 'string') return item;
  // http(s)://host[:port]/uploads/xxx → /uploads/xxx
  const m = item.match(/^https?:\/\/[^/]+(\/.*)$/i);
  return m ? m[1] : item;
}

function run() {
  const rows = db.prepare(`SELECT id, image_urls FROM meal_record`).all();
  const update = db.prepare(`UPDATE meal_record SET image_urls = ? WHERE id = ?`);
  let changed = 0;

  const tx = db.transaction(() => {
    for (const row of rows) {
      let arr = [];
      try {
        arr = JSON.parse(row.image_urls || '[]');
      } catch (_e) {
        continue;
      }
      const next = arr.map(normalize);
      if (JSON.stringify(next) !== JSON.stringify(arr)) {
        update.run(JSON.stringify(next), row.id);
        changed++;
      }
    }
  });
  tx();

  console.log(`[normalize-urls] rows scanned: ${rows.length}, updated: ${changed}`);
}

run();
if (require.main === module) process.exit(0);
