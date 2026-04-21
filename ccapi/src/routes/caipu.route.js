const express = require('express');
const ctrl = require('../controllers/caipu.controller');

const router = express.Router();

// 菜品查询（分页 + 关键词）
router.get('/list', ctrl.list);

// 菜谱分类
router.get('/category', ctrl.category);

// 菜谱详情（代理天行 API）
router.get('/detail', ctrl.detail);

module.exports = router;
