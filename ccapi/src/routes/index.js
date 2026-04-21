const express = require('express');
const mealRouter = require('./meal.route');
const caipuRouter = require('./caipu.route');

const router = express.Router();

router.get('/health', (_req, res) => res.json({ code: 0, message: 'ok' }));
router.use('/meal', mealRouter);
router.use('/caipu', caipuRouter);

module.exports = router;
