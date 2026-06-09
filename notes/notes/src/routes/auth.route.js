const express = require('express');
const ctrl = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', ctrl.login);
router.get('/session', ctrl.session);
router.post('/logout', ctrl.logout);

module.exports = router;
