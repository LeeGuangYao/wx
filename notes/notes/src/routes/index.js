const express = require('express');
const authRoute = require('./auth.route');
const folderRoute = require('./folder.route');
const noteRoute = require('./note.route');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/folders', requireAuth, folderRoute);
router.use('/notes', requireAuth, noteRoute);

module.exports = router;
