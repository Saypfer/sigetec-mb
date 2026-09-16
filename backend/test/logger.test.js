const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createLogger } = require("../src/utils/logger");

test("emite registros JSON con campos operativos consistentes", () => {
  const lines = [];
  const logger = createLogger({
    write: (line) => lines.push(line),
    now: () => "2026-09-15T12:00:00.000Z",
  });

  logger.info("server_started", { host: "0.0.0.0", port: 4000 });

  assert.deepEqual(JSON.parse(lines[0]), {
    host: "0.0.0.0",
    port: 4000,
    timestamp: "2026-09-15T12:00:00.000Z",
    level: "info",
    service: "sigetec-mb-backend",
    event: "server_started",
  });
});

test("oculta contraseñas de PostgreSQL y tokens Bearer en errores", () => {
  const lines = [];
  const logger = createLogger({
    errorWrite: (line) => lines.push(line),
    now: () => "2026-09-15T12:00:00.000Z",
  });
  const error = new Error(
    "Falló postgres://usuario:clave-secreta@db.example.com/sigetec con Bearer token-secreto"
  );

  logger.error("database_failed", {}, error);

  const record = JSON.parse(lines[0]);
  assert.equal(record.level, "error");
  assert.match(record.error.message, /\[REDACTED\]/);
  assert.doesNotMatch(record.error.message, /clave-secreta|token-secreto/);
  assert.doesNotMatch(record.error.stack, /clave-secreta|token-secreto/);
});
