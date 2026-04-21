// 菜谱业务层：本地 caipu.json 做搜索/分类，详情走天行 API 代理
const loader = require('../data/caipu-loader');

// 分类展示顺序：菜品/菜系 → 汤 → 蛋/主食 → 甜品 → 饮料酒水 → 其他
// 与 caipu.grouped.json 的文件顺序保持一致
const CATEGORY_ORDER = [
  '凉菜类', '凉拌类', '家常凉菜',
  '家常热菜',
  '半荤', '小荤', '全荤',
  '素菜', '素食者', '蔬菜类',
  '猪肉类', '牛羊肉类', '禽肉及其他肉类', '水产类',
  '淮扬菜', '沪菜', '苏菜', '浙菜', '川菜', '粤菜',
  '鲁菜', '闽菜', '湘菜', '徽菜', '京菜', '东北菜',
  '湖北菜', '云南菜', '陕西菜', '豫菜', '海派菜', '民族菜',
  '韩国料理', '日本料理', '法国菜', '意大利菜', '东南亚风味',
  '家常西餐', '其他西餐',
  '汤煲类', '汤类',
  '鸡蛋及豆制品类', '主食类', '家常主食',
  '甜品及点心类', '家常点心',
  '中国名酒', '外国名酒', '果酒', '鸡尾酒',
  '中国名茶', '鸡尾茶',
  '咖啡', '奶制饮品', '果汁及水', '固体饮料', '其它饮品',
  '微波炉菜', '风味食品', '方便食品',
  '泡菜类', '酱渍类', '腌渍类', '糖渍类', '泡渍类',
  '婴儿类', '幼儿', '老年人', '情人',
  '第一道菜', '第二道菜', '第三道菜', '第四道菜', '第五道菜', '第六道菜',
  '其它',
];
const ORDER_INDEX = new Map(CATEGORY_ORDER.map((n, i) => [n, i]));

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
  const rank = (name) => (ORDER_INDEX.has(name) ? ORDER_INDEX.get(name) : Number.MAX_SAFE_INTEGER);
  return Array.from(map.values()).sort((a, b) => {
    const ra = rank(a.type_name);
    const rb = rank(b.type_name);
    if (ra !== rb) return ra - rb;
    return a.type_id - b.type_id;
  });
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
