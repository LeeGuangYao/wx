const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const routes = require('./routes');
const authMiddleware = require('./middlewares/auth');
const { errorHandler, notFound } = require('./middlewares/error');

const app = express();

app.set('trust proxy', true);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(config.uploadDir));

app.use(authMiddleware);
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
