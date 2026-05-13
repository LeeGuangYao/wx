const { ok } = require('../utils/response');

// 底部菜单权限：visible 为 true 的项前端才渲染。
// 需要放开隐藏项时，直接把对应条目加入数组并设为 visible: true。
const TABS = [
  { key: 'list',      text: '找菜', pagePath: '/pages/list/index',      visible: true },
  { key: 'category',  text: '逛逛', pagePath: '/pages/category/index',  visible: true },
  { key: 'recommend', text: '吃啥', pagePath: '/pages/recommend/index', visible: true },
  // { key: 'meal',      text: '食记', pagePath: '/pages/meal/index',      visible: true }
];

async function getConfig(_req, res, next) {
  try {
    res.json(ok({ tabs: TABS }));
  } catch (err) {
    next(err);
  }
}

module.exports = { getConfig };
