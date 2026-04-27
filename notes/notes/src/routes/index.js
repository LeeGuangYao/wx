const express = require('express');
const noteRoute = require('./note.route');

const router = express.Router();

router.use('/notes', noteRoute);

module.exports = router;
