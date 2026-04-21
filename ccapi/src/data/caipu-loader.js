// 菜谱数据加载：caipu.json 一次性读入内存，进程生命周期内复用
const fs = require('fs');
const path = require('path');

const CAIPU_PATH = path.join(__dirname, '..', '..', 'caipu.json');

let cache = null;

function load() {
  if (!cache) {
    const raw = fs.readFileSync(CAIPU_PATH, 'utf8');
    cache = JSON.parse(raw);
  }
  return cache;
}

module.exports = { load };
