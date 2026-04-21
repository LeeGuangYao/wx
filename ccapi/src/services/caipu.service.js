// 菜谱业务层：本地 caipu.json 做搜索/分类，详情走天行 API 代理
const loader = require('../data/caipu-loader');

const TIANAPI_KEY = 'b3dacac137e96e9f4d0499d08b49e532';
const TIANAPI_URL = 'https://apis.tianapi.com/caipu/cpinfo';

function search({ num, page, word }) {
  const data = loader.load();

  const n = Math.max(1, Math.min(100, Number(num) || 10));
  const p = Math.max(1, Number(page) || 1);
  const kw = (word || '').trim();

  const filtered = kw
    ? data.filter(
        (d) =>
          (d.cp_name || '').includes(kw) ||
          (d.texing || '').includes(kw) ||
          (d.type_name || '').includes(kw)
      )
    : data;

  const allnum = filtered.length;
  const start = (p - 1) * n;
  const list = filtered.slice(start, start + n);

  return { curpage: p, allnum, list };
}

function categories() {
  const data = loader.load();
  const map = new Map();
  for (const d of data) {
    if (!map.has(d.type_id)) {
      map.set(d.type_id, {
        type_id: d.type_id,
        type_name: d.type_name,
        count: 0,
      });
    }
    map.get(d.type_id).count += 1;
  }
  return Array.from(map.values()).sort((a, b) => a.type_id - b.type_id);
}

async function detail(id) {
  const url = `${TIANAPI_URL}?key=${TIANAPI_KEY}&id=${encodeURIComponent(id)}`;
  const resp = await fetch(url);
  const text = await resp.text();
  // 原样透传上游响应（JSON 文本）
  try {
    return JSON.parse(text);
  } catch (_e) {
    return { code: resp.status, msg: 'upstream non-json', result: text };
  }
}

module.exports = { search, categories, detail };
