require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 4000;

async function start() {
  await sequelize.authenticate();
  console.log("Conexión a la base de datos establecida.");
  app.listen(PORT, () => {
    console.log(`Servidor SIGETEC-MB escuchando en http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exit(1);
});
