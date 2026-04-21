// 菜谱接口 controller：使用天行 API 风格响应 { code, msg, result }
const service = require('../services/caipu.service');

function list(req, res, next) {
  try {
    const { num, page, word } = req.query;
    const result = service.search({ num, page, word });
    res.json({ code: 200, msg: 'success', result });
  } catch (err) {
    next(err);
  }
}

function category(_req, res, next) {
  try {
    const result = service.categories();
    res.json({ code: 200, msg: 'success', result });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .json({ code: 400, msg: 'id 必填', result: null });
    }
    const data = await service.detail(id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, category, detail };
