const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error');

const app = express();

// 反向代理（Nginx / ELB 等）下，读 X-Forwarded-* 得到真实协议和 host
app.set('trust proxy', true);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 图片静态访问：GET /uploads/xxx.jpg
app.use('/uploads', express.static(config.uploadDir));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
