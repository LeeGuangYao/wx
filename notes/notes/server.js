const migrate = require('./src/db/migrate');
const app = require('./src/app');
const config = require('./src/config');

migrate();

app.listen(config.port, () => {
  console.log(`[server] listening on port ${config.port}`);
});
