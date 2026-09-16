const assert = require("node:assert/strict");
const { test } = require("node:test");

const { asyncHandler } = require("../src/utils/asyncHandler");
const { requireRole } = require("../src/middleware/role");
const { notFoundHandler, errorHandler } = require("../src/middleware/errorHandler");

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

test("asyncHandler entrega al middleware de errores una promesa rechazada", async () => {
  const expectedError = new Error("fallo controlado");
  const handled = asyncHandler(async () => {
    throw expectedError;
  });

  const receivedError = await new Promise((resolve) => {
    handled({}, createResponse(), resolve);
  });

  assert.equal(receivedError, expectedError);
});

test("requireRole permite continuar cuando el usuario tiene un rol autorizado", () => {
  let nextCalled = false;
  const middleware = requireRole("admin");

  middleware({ user: { role: "admin" } }, createResponse(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test("requireRole responde 403 cuando el rol no está autorizado", () => {
  const response = createResponse();
  const middleware = requireRole("admin");

  middleware({ user: { role: "tecnico" } }, response, () => {
    assert.fail("next no debe ejecutarse");
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.payload, { message: "No tienes permisos para esta acción" });
});

test("notFoundHandler genera la respuesta estándar para rutas inexistentes", () => {
  const response = createResponse();

  notFoundHandler({}, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.payload, { message: "Recurso no encontrado" });
});

test("errorHandler respeta el estado y mensaje de un error conocido", () => {
  const response = createResponse();
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    errorHandler({ status: 422, message: "Solicitud inválida" }, {}, response, () => {});
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.statusCode, 422);
  assert.deepEqual(response.payload, { message: "Solicitud inválida" });
});

test("errorHandler no expone el mensaje de un error interno", () => {
  const response = createResponse();
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    errorHandler(new Error("password de PostgreSQL incorrecto"), {}, response, () => {});
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.payload, { message: "Error interno del servidor" });
});
