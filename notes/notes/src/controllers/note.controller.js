const noteService = require('../services/note.service');
const { ok, fail } = require('../utils/response');

function parseId(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function list(req, res, next) {
  try {
    const data = noteService.list();
    res.json(ok(data));
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json(fail('id 非法', 400));

    const note = noteService.findById(id);
    if (!note) return res.status(404).json(fail('笔记不存在', 404));

    res.json(ok(note));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { content } = req.body;
    const note = noteService.create(content);
    res.json(ok(note, '创建成功'));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json(fail('id 非法', 400));

    const { content } = req.body;
    const note = noteService.update(id, content);
    if (!note) return res.status(404).json(fail('笔记不存在', 404));

    res.json(ok(note, '更新成功'));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json(fail('id 非法', 400));

    const removed = noteService.remove(id);
    if (!removed) return res.status(404).json(fail('笔记不存在', 404));

    res.json(ok(null, '删除成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, create, update, remove };
