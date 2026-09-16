const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { test } = require("node:test");
const { createRequestContext } = require("../src/middleware/requestContext");

test("asigna un identificador y registra solo metadatos seguros de la solicitud", () => {
  const records = [];
  const logger = {
    info: (event, fields) => records.push({ level: "info", event, ...fields }),
    warn: (event, fields) => records.push({ level: "warn", event, ...fields }),
    error: (event, fields) => records.push({ level: "error", event, ...fields }),
  };
  const times = [1000, 1025];
  const middleware = createRequestContext({
    logger,
    createId: () => "request-id-123",
    now: () => times.shift(),
  });
  const request = {
    method: "POST",
    path: "/api/auth/login",
    headers: { authorization: "Bearer token-secreto" },
    body: { password: "clave-secreta" },
  };
  const response = new EventEmitter();
  response.statusCode = 401;
  response.writableEnded = true;
  response.setHeader = (name, value) => {
    response.headers ??= {};
    response.headers[name] = value;
  };

  let nextCalled = false;
  middleware(request, response, () => {
    nextCalled = true;
    request.user = { id: 7 };
  });
  response.emit("finish");

  assert.equal(nextCalled, true);
  assert.equal(request.requestId, "request-id-123");
  assert.equal(response.headers["X-Request-Id"], "request-id-123");
  assert.deepEqual(records, [
    {
      level: "warn",
      event: "http_request",
      requestId: "request-id-123",
      method: "POST",
      path: "/api/auth/login",
      statusCode: 401,
      durationMs: 25,
      outcome: "completed",
      userId: 7,
    },
  ]);
  assert.doesNotMatch(JSON.stringify(records), /token-secreto|clave-secreta/);
});
