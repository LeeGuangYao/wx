require('dotenv').config();
const path = require('path');

const config = {
  port: Number(process.env.PORT) || 3175,
  dbPath: path.resolve(process.env.DB_PATH || './data/notes.db'),
};

module.exports = config;
