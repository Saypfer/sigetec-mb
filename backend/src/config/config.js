const { env } = require("./env");

const shared = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  dialectOptions: env.dbSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  logging: false,
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
