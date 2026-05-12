const express = require('express');
const mealRouter = require('./meal.route');
const caipuRouter = require('./caipu.route');
const configRouter = require('./config.route');
const authRouter = require('./auth.route');

const router = express.Router();

router.get('/health', (_req, res) => res.json({ code: 0, message: 'ok' }));
router.use('/auth', authRouter);
router.use('/meal', mealRouter);
router.use('/caipu', caipuRouter);
router.use('/config', configRouter);

module.exports = router;
