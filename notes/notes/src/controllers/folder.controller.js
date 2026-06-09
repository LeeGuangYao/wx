const folderService = require('../services/folder.service');
const { ok, fail } = require('../utils/response');

function parseId(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function list(_req, res, next) {
  try {
    res.json(ok(folderService.list()));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const folder = folderService.create(req.body.name);
    res.json(ok(folder, '创建成功'));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json(fail('id 非法', 400));

    const folder = folderService.update(id, req.body.name);
    if (!folder) return res.status(404).json(fail('分类不存在', 404));

    res.json(ok(folder, '更新成功'));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json(fail('id 非法', 400));

    const removed = folderService.remove(id);
    if (!removed) return res.status(404).json(fail('分类不存在', 404));

    res.json(ok(null, '删除成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
