require("dotenv").config();

const useSsl = process.env.DB_SSL !== "false";

const shared = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  logging: false,
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
