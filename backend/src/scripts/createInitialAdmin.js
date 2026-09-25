const { sequelize, User } = require("../models");
const {
  createInitialAdmin,
  parseInitialAdminConfig,
} = require("../services/adminBootstrap");

async function run() {
  const config = parseInitialAdminConfig(process.env);
  await sequelize.authenticate();

  const admin = await createInitialAdmin({ sequelize, User, config });
  console.log(`Administrador inicial creado: ${admin.email}`);
}

run()
  .catch((error) => {
    console.error(`No se pudo crear el administrador inicial: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
