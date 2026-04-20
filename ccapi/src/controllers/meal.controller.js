const mealService = require('../services/meal.service');
const { ok, fail } = require('../utils/response');
const { getBaseUrl } = require('../utils/baseUrl');

// 统一的 id 校验：必须为正整数
function parseId(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function create(req, res, next) {
  try {
    const { title, content } = req.body;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json(fail('至少需要上传一张图片', 400));
    }

    const record = mealService.create({ title, content, files }, getBaseUrl(req));
    res.json(ok(record, '创建成功'));
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, pageSize } = req.query;
    const data = mealService.list({ page, pageSize }, getBaseUrl(req));
    res.json(ok(data));
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json(fail('id 非法', 400));

    const record = mealService.findById(id, getBaseUrl(req));
    if (!record) return res.status(404).json(fail('记录不存在', 404));

    res.json(ok(record));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json(fail('id 非法', 400));

    const removed = mealService.remove(id);
    if (!removed) return res.status(404).json(fail('记录不存在', 404));

    res.json(ok(null, '删除成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, detail, remove };
