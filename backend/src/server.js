const { registerGracefulShutdown } = require("./utils/gracefulShutdown");
const { logger } = require("./utils/logger");

async function start() {
  const { env } = require("./config/env");
  const app = require("./app");
  const { sequelize } = require("./models");

  await sequelize.authenticate();
  logger.info("database_connected");

  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(env.port, env.host, () => resolve(instance));
    instance.once("error", reject);
  });

  registerGracefulShutdown({
    server,
    database: sequelize,
    timeoutMs: env.shutdownTimeoutMs,
    logger,
  });

  logger.info("server_started", { host: env.host, port: env.port });
}

start().catch((error) => {
  logger.error("server_start_failed", {}, error);
  process.exit(1);
});
