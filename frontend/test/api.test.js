import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  createInventoryItem,
  getDashboard,
  getReports,
  loginUser,
} from "../src/api.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(data, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return data;
    },
  };
}

test("loginUser envía las credenciales al endpoint de autenticación", async () => {
  let receivedUrl;
  let receivedOptions;
  globalThis.fetch = async (url, options) => {
    receivedUrl = url;
    receivedOptions = options;
    return jsonResponse({ token: "token-de-prueba" });
  };

  const result = await loginUser({ email: "admin@example.com", password: "secreto" });

  assert.equal(receivedUrl, "http://127.0.0.1:4000/api/auth/login");
  assert.equal(receivedOptions.method, "POST");
  assert.equal(receivedOptions.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(receivedOptions.body), {
    email: "admin@example.com",
    password: "secreto",
  });
  assert.deepEqual(result, { token: "token-de-prueba" });
});

test("las solicitudes autenticadas incluyen el token Bearer", async () => {
  let receivedOptions;
  globalThis.fetch = async (_url, options) => {
    receivedOptions = options;
    return jsonResponse({ orders: 4 });
  };

  await getDashboard("abc123");

  assert.equal(receivedOptions.headers.Authorization, "Bearer abc123");
});

test("createInventoryItem serializa el contenido solicitado", async () => {
  let receivedOptions;
  globalThis.fetch = async (_url, options) => {
    receivedOptions = options;
    return jsonResponse({ id: 12 });
  };

  await createInventoryItem("token", { code: "REP-01", quantity: 5 });

  assert.equal(receivedOptions.method, "POST");
  assert.deepEqual(JSON.parse(receivedOptions.body), { code: "REP-01", quantity: 5 });
});

test("getReports agrega únicamente los filtros con valor", async () => {
  let receivedUrl;
  globalThis.fetch = async (url) => {
    receivedUrl = url;
    return jsonResponse({});
  };

  await getReports("token", { from: "2026-08-01", to: "", status: "Finalizado" });

  assert.equal(
    receivedUrl,
    "http://127.0.0.1:4000/api/reports/summary?from=2026-08-01&status=Finalizado",
  );
});

test("los errores HTTP conservan estado, campos y mensaje de validación", async () => {
  globalThis.fetch = async () =>
    jsonResponse(
      {
        message: "Revisa los datos ingresados",
        errors: { email: "Ingresa un correo válido" },
      },
      { ok: false, status: 400 },
    );

  await assert.rejects(
    () => loginUser({ email: "invalido", password: "secreto" }),
    (error) => {
      assert.equal(error.status, 400);
      assert.deepEqual(error.fields, { email: "Ingresa un correo válido" });
      assert.equal(error.message, "Revisa los datos ingresados: Ingresa un correo válido");
      return true;
    },
  );
});
