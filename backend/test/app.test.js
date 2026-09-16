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

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /health informa que el servidor está disponible", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("una ruta inexistente devuelve una respuesta JSON 404", async () => {
  const response = await fetch(`${baseUrl}/ruta-inexistente`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: "Recurso no encontrado" });
});

test("un cuerpo JSON inválido devuelve un error controlado", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{json-incompleto",
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "El cuerpo de la solicitud contiene JSON inválido",
  });
});
