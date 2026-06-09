const migrate = require('./src/db/migrate');
const app = require('./src/app');
const config = require('./src/config');

migrate();

app.listen(config.port, config.host, () => {
  console.log(`[server] listening on ${config.host}:${config.port}`);
});
