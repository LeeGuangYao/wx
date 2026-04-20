// 入口：启动前先跑一次 migrate，保证表存在
const migrate = require('./src/db/migrate');
const app = require('./src/app');
const config = require('./src/config');

migrate();

app.listen(config.port, () => {
  console.log(`[server] listening on ${config.baseUrl}`);
  console.log(`[server] uploads dir: ${config.uploadDir}`);
});
