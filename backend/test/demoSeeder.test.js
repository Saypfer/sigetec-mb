const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

const demoSeeder = require("../src/seeders/20260722000001-demo-data");

const originalNodeEnv = process.env.NODE_ENV;
const originalSeedPassword = process.env.DEMO_SEED_PASSWORD;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;

  if (originalSeedPassword === undefined) delete process.env.DEMO_SEED_PASSWORD;
  else process.env.DEMO_SEED_PASSWORD = originalSeedPassword;
});

test("impide ejecutar el seeder de demostración en producción", async () => {
  process.env.NODE_ENV = "production";
  process.env.DEMO_SEED_PASSWORD = "una-clave-segura-de-prueba";

  await assert.rejects(
    () => demoSeeder.up(),
    /El seeder de demostración no está permitido en producción/,
  );
});

test("exige una contraseña explícita y suficientemente larga para datos demo", async () => {
  process.env.NODE_ENV = "development";
  delete process.env.DEMO_SEED_PASSWORD;

  await assert.rejects(
    () => demoSeeder.up(),
    /DEMO_SEED_PASSWORD debe contener al menos 12 caracteres/,
  );
});
