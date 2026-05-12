const express = require('express');
const ctrl = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', ctrl.login);
router.get('/users', ctrl.listUsers);

module.exports = router;
