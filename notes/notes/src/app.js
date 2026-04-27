const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error');

const app = express();

app.set('trust proxy', true);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', routes);

// SPA fallback: non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
