const { env } = require("./config/env");
const app = require("./app");
const { sequelize } = require("./models");
const { registerGracefulShutdown } = require("./utils/gracefulShutdown");

async function start() {
  await sequelize.authenticate();
  console.log("Conexión a la base de datos establecida.");

  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(env.port, env.host, () => resolve(instance));
    instance.once("error", reject);
  });

  registerGracefulShutdown({
    server,
    database: sequelize,
    timeoutMs: env.shutdownTimeoutMs,
  });

  console.log(`Servidor SIGETEC-MB escuchando en http://${env.host}:${env.port}`);
}

start().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exit(1);
});
