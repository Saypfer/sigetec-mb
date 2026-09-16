const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:5432/sigetec_test";
process.env.DB_SSL = "false";
process.env.JWT_SECRET = "test-secret-for-automated-tests";

const app = require("../src/app");

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("valida el login y bloquea el sexto intento fallido durante 15 minutos", async () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "correo-invalido", password: "incorrecta" }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.message, "Revisa los datos ingresados");
    assert.equal(body.errors.email, "Ingresa un correo válido");
  }

  const blockedResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "correo-invalido", password: "incorrecta" }),
  });

  assert.equal(blockedResponse.status, 429);
  assert.ok(blockedResponse.headers.get("retry-after"));
  assert.deepEqual(await blockedResponse.json(), {
    message: "Demasiados intentos de acceso. Intenta nuevamente en 15 minutos",
  });
});
