const express = require('express');
const ctrl = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', ctrl.login);
router.get('/password/status', ctrl.passwordStatus);
router.post('/password/verify', ctrl.passwordVerify);
router.get('/users', ctrl.listUsers);

module.exports = router;
