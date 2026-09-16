const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  normalizeBaseUrl,
  parseSmokeOptions,
  runSmokeChecks,
} = require("../src/utils/smokeChecks");

test("normaliza las URLs públicas sin permitir credenciales", () => {
  assert.equal(normalizeBaseUrl("https://app.example.com/", "APP"), "https://app.example.com");
  assert.throws(
    () => normalizeBaseUrl("https://usuario:secreto@app.example.com", "APP"),
    /no contener credenciales/
  );
});

test("acepta URLs mediante argumentos o variables de entorno", () => {
  assert.deepEqual(
    parseSmokeOptions(
      ["--frontend-url=https://app.example.com", "--backend-url", "https://api.example.com"],
      {}
    ),
    {
      frontendUrl: "https://app.example.com",
      backendUrl: "https://api.example.com",
    }
  );
  assert.deepEqual(parseSmokeOptions([], {
    FRONTEND_URL: "https://app.example.com",
    BACKEND_URL: "https://api.example.com",
  }), {
    frontendUrl: "https://app.example.com",
    backendUrl: "https://api.example.com",
  });
});

test("verifica frontend, salud, disponibilidad y cabeceras críticas", async () => {
  const responses = new Map([
    [
      "https://app.example.com/",
      new Response("<!doctype html>", {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": "default-src 'self'",
        },
      }),
    ],
    [
      "https://app.example.com/health",
      Response.json({ status: "ok" }),
    ],
    [
      "https://api.example.com/health",
      Response.json(
        { status: "ok" },
        { headers: { "X-Content-Type-Options": "nosniff", "X-Request-Id": "request-123" } }
      ),
    ],
    [
      "https://api.example.com/ready",
      Response.json({ status: "ready" }),
    ],
  ]);
  const requestedUrls = [];
  const fetchImpl = async (url) => {
    requestedUrls.push(url);
    return responses.get(url);
  };

  const results = await runSmokeChecks({
    frontendUrl: "https://app.example.com",
    backendUrl: "https://api.example.com",
    fetchImpl,
  });

  assert.deepEqual(results, ["frontend", "frontend-health", "backend-health", "backend-ready"]);
  assert.equal(requestedUrls.length, 4);
});
