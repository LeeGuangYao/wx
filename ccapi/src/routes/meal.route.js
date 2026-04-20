const express = require('express');
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/meal.controller');

const router = express.Router();

// 创建食记，images 字段支持多文件
router.post('/create', upload.array('images'), ctrl.create);

// 列表（分页）: ?page=1&pageSize=10
router.get('/list', ctrl.list);

// 详情
router.get('/:id', ctrl.detail);

// 删除（连同本地图片一起清理）
router.delete('/:id', ctrl.remove);

module.exports = router;
