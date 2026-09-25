const { env } = require("./env");
const pg = require("pg");

const shared = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  // Importacion explicita para incluir el driver en el paquete serverless.
  dialectModule: pg,
  dialectOptions: env.dbSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  logging: false,
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
