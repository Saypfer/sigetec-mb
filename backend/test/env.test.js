const assert = require("node:assert/strict");
const { test } = require("node:test");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:5432/sigetec_test";
process.env.DB_SSL = "false";
process.env.JWT_SECRET = "test-secret-for-automated-tests";

const { buildConfig } = require("../src/config/env");

const validProductionEnv = {
  NODE_ENV: "production",
  HOST: "0.0.0.0",
  PORT: "4000",
  SHUTDOWN_TIMEOUT_MS: "10000",
  DATABASE_URL: "postgresql://user:password@database.example.com:5432/sigetec",
  DB_SSL: "true",
  JWT_SECRET: "a-secure-production-secret-with-32-chars",
  JWT_EXPIRES_IN: "8h",
  CORS_ORIGIN: "https://app.example.com",
  TRUST_PROXY_HOPS: "1",
};

test("acepta y transforma una configuración válida de producción", () => {
  const config = buildConfig(validProductionEnv);

  assert.equal(config.isProduction, true);
  assert.equal(config.port, 4000);
  assert.equal(config.host, "0.0.0.0");
  assert.equal(config.shutdownTimeoutMs, 10000);
  assert.equal(config.dbSsl, true);
  assert.equal(config.trustProxy, 1);
  assert.deepEqual(config.corsOrigins, ["https://app.example.com"]);
});

test("rechaza una configuración sin DATABASE_URL", () => {
  assert.throws(
    () => buildConfig({ ...validProductionEnv, DATABASE_URL: "" }),
    /DATABASE_URL es requerida/,
  );
});

test("rechaza el secreto JWT inseguro del archivo de ejemplo", () => {
  assert.throws(
    () => buildConfig({ ...validProductionEnv, JWT_SECRET: "change-me-in-production" }),
    /valor inseguro/,
  );
});

test("requiere un secreto JWT de al menos 32 caracteres en producción", () => {
  assert.throws(
    () => buildConfig({ ...validProductionEnv, JWT_SECRET: "demasiado-corto" }),
    /al menos 32 caracteres/,
  );
});

test("requiere CORS_ORIGIN explícito en producción", () => {
  assert.throws(
    () => buildConfig({ ...validProductionEnv, CORS_ORIGIN: "" }),
    /CORS_ORIGIN es requerida/,
  );
});

test("rechaza valores booleanos ambiguos", () => {
  assert.throws(
    () => buildConfig({ ...validProductionEnv, DB_SSL: "yes" }),
    /DB_SSL debe ser "true" o "false"/,
  );
});

test("rechaza un tiempo de apagado fuera del rango seguro", () => {
  assert.throws(
    () => buildConfig({ ...validProductionEnv, SHUTDOWN_TIMEOUT_MS: "500" }),
    /SHUTDOWN_TIMEOUT_MS debe ser un entero entre 1000 y 60000/,
  );
});

test("rechaza un host vacío o con espacios", () => {
  assert.throws(
    () => buildConfig({ ...validProductionEnv, HOST: "host no válido" }),
    /HOST debe ser una dirección o nombre de host válido/,
  );
});
