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
  const databaseError = new Error("password authentication failed");
  const database = {
    async authenticate() {
      throw databaseError;
    },
  };
  let loggedError;
  const logger = {
    error(event, fields, error) {
      loggedError = { event, fields, error };
    },
  };
  const response = createResponse();

  await createReadinessHandler(database, logger)({ requestId: "request-123" }, response);

  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.payload, { status: "unavailable" });
  assert.deepEqual(loggedError, {
    event: "database_readiness_failed",
    fields: { requestId: "request-123" },
    error: databaseError,
  });
});
