const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createShutdownHandler } = require("../src/utils/gracefulShutdown");

test("cierra HTTP y PostgreSQL antes de terminar correctamente", async () => {
  const actions = [];
  const server = {
    close(callback) {
      actions.push("http");
      callback();
    },
    closeIdleConnections() {
      actions.push("idle");
    },
  };
  const database = {
    async close() {
      actions.push("database");
    },
  };
  const logger = { log() {}, error() {} };
  const exitCodes = [];
  const shutdown = createShutdownHandler({
    server,
    database,
    timeoutMs: 1000,
    logger,
    exit: (code) => exitCodes.push(code),
  });

  await shutdown("SIGTERM");

  assert.deepEqual(actions, ["http", "idle", "database"]);
  assert.deepEqual(exitCodes, [0]);
});

test("ignora señales repetidas durante el cierre", async () => {
  let closeCalls = 0;
  const server = {
    close(callback) {
      closeCalls += 1;
      callback();
    },
  };
  const database = { async close() {} };
  const logger = { log() {}, error() {} };
  const shutdown = createShutdownHandler({
    server,
    database,
    timeoutMs: 1000,
    logger,
    exit() {},
  });

  await shutdown("SIGTERM");
  await shutdown("SIGINT");

  assert.equal(closeCalls, 1);
});
