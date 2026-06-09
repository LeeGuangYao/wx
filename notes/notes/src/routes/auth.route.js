const express = require('express');
const ctrl = require('../controllers/auth.controller');
const { blockExcessiveLoginFailures } = require('../middlewares/login-limit');

const router = express.Router();

router.post('/login', blockExcessiveLoginFailures, ctrl.login);
router.get('/session', ctrl.session);
router.post('/logout', ctrl.logout);

module.exports = router;
