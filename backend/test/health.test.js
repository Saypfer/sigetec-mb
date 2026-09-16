const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createReadinessHandler, liveness } = require("../src/controllers/health.controller");

function createResponse() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test("liveness confirma que el proceso HTTP está activo", () => {
  const response = createResponse();

  liveness({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.payload, { status: "ok" });
});

test("readiness confirma una conexión disponible con PostgreSQL", async () => {
  let checks = 0;
  const database = {
    async authenticate() {
      checks += 1;
    },
  };
  const response = createResponse();

  await createReadinessHandler(database)({}, response);

  assert.equal(checks, 1);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.payload, { status: "ready" });
});

test("readiness devuelve 503 sin exponer el error de PostgreSQL", async () => {
  const database = {
    async authenticate() {
      throw new Error("password authentication failed");
    },
  };
  const logger = { error() {} };
  const response = createResponse();

  await createReadinessHandler(database, logger)({}, response);

  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.payload, { status: "unavailable" });
});
