const express = require('express');
const ctrl = require('../controllers/config.controller');

const router = express.Router();

router.get('/', ctrl.getConfig);

module.exports = router;
