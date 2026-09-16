const { env } = require("./config/env");
const app = require("./app");
const { sequelize } = require("./models");

async function start() {
  await sequelize.authenticate();
  console.log("Conexión a la base de datos establecida.");
  app.listen(env.port, () => {
    console.log(`Servidor SIGETEC-MB escuchando en http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exit(1);
});
