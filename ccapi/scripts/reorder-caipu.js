// 一次性脚本：过滤医疗/进补类分类 + 按新顺序重排 caipu.grouped.json
// 同步过滤 caipu.json 中的对应记录
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CAIPU = path.join(ROOT, 'caipu.json');
const GROUPED = path.join(ROOT, 'caipu.grouped.json');

const REMOVE = new Set([
  '肿瘤癌症',
  '糖尿病人菜肴',
  '更年期妇女',
  '保健美容',
  '补气补血',
  '补阴补阳',
  '补肝肾',
  '保健菜肴',
  '保健饮品',
  '塑身美容',
  '益寿',
  '循环系统疾病',
  '消化系统疾病',
  '五官科疾病',
  '神经系统疾病',
  '呼吸系统疾病',
  '孕产妇',
]);

// 期望展示顺序（按 type_name）
const ORDER = [
  // 凉/热/荤素
  '凉菜类', '凉拌类', '家常凉菜',
  '家常热菜',
  '半荤', '小荤', '全荤',
  '素菜', '素食者', '蔬菜类',
  '猪肉类', '牛羊肉类', '禽肉及其他肉类', '水产类',
  // 中式菜系
  '淮扬菜', '沪菜', '苏菜', '浙菜', '川菜', '粤菜',
  '鲁菜', '闽菜', '湘菜', '徽菜', '京菜', '东北菜',
  '湖北菜', '云南菜', '陕西菜', '豫菜', '海派菜', '民族菜',
  // 异国料理
  '韩国料理', '日本料理', '法国菜', '意大利菜', '东南亚风味',
  '家常西餐', '其他西餐',
  // 汤
  '汤煲类', '汤类',
  // 蛋/主食
  '鸡蛋及豆制品类', '主食类', '家常主食',
  // 甜品点心
  '甜品及点心类', '家常点心',
  // 饮料酒水
  '中国名酒', '外国名酒', '果酒', '鸡尾酒',
  '中国名茶', '鸡尾茶',
  '咖啡', '奶制饮品', '果汁及水', '固体饮料', '其它饮品',
  // 其他/不明确
  '微波炉菜', '风味食品', '方便食品',
  '泡菜类', '酱渍类', '腌渍类', '糖渍类', '泡渍类',
  '婴儿类', '幼儿', '老年人', '情人',
  '第一道菜', '第二道菜', '第三道菜', '第四道菜', '第五道菜', '第六道菜',
  '其它',
];

function reorderGrouped() {
  const arr = JSON.parse(fs.readFileSync(GROUPED, 'utf8'));
  const kept = arr.filter((g) => !REMOVE.has(g.type_name));
  const orderIndex = new Map(ORDER.map((n, i) => [n, i]));
  const ranked = kept
    .map((g) => ({ g, rank: orderIndex.has(g.type_name) ? orderIndex.get(g.type_name) : Number.MAX_SAFE_INTEGER }))
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.g);

  // 校验：所有保留的分类都应该在 ORDER 里
  const missing = kept.filter((g) => !orderIndex.has(g.type_name)).map((g) => g.type_name);
  if (missing.length) {
    console.warn('[warn] 未在 ORDER 中定义顺序的分类（已置末尾）:', missing);
  }

  fs.writeFileSync(GROUPED, JSON.stringify(ranked, null, 2) + '\n', 'utf8');
  console.log(`[grouped] ${arr.length} → ${ranked.length}（移除 ${arr.length - ranked.length}）`);
}

function filterCaipu() {
  const arr = JSON.parse(fs.readFileSync(CAIPU, 'utf8'));
  const kept = arr.filter((d) => !REMOVE.has(d.type_name));
  fs.writeFileSync(CAIPU, JSON.stringify(kept, null, 2) + '\n', 'utf8');
  console.log(`[caipu]   ${arr.length} → ${kept.length}（移除 ${arr.length - kept.length}）`);
}

reorderGrouped();
filterCaipu();
