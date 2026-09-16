function normalizeBaseUrl(value, label) {
  let url;
  try {
    url = new URL(String(value ?? ""));
  } catch {
    throw new Error(`${label} debe ser una URL válida`);
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${label} debe usar HTTP/HTTPS y no contener credenciales`);
  }
  if (url.search || url.hash) throw new Error(`${label} no debe incluir query ni fragmento`);
  return url.toString().replace(/\/$/, "");
}

function parseSmokeOptions(argv, source = process.env) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const separator = argument.indexOf("=");
    const name = argument.slice(2, separator === -1 ? undefined : separator);
    if (!argument.startsWith("--") || !["frontend-url", "backend-url"].includes(name)) {
      throw new Error(`Opción no reconocida: ${argument}`);
    }
    const value = separator === -1 ? argv[++index] : argument.slice(separator + 1);
    if (!value || value.startsWith("--")) throw new Error(`--${name} requiere un valor`);
    options[name] = value;
  }

  return {
    frontendUrl: normalizeBaseUrl(options["frontend-url"] || source.FRONTEND_URL, "FRONTEND_URL"),
    backendUrl: normalizeBaseUrl(options["backend-url"] || source.BACKEND_URL, "BACKEND_URL"),
  };
}

async function checkedFetch(fetchImpl, url, timeoutMs) {
  try {
    return await fetchImpl(url, {
      headers: { Accept: "application/json, text/html" },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new Error(`No se pudo consultar ${url}: ${error.message}`);
  }
}

async function expectJsonStatus(fetchImpl, url, expectedStatus, timeoutMs) {
  const response = await checkedFetch(fetchImpl, url, timeoutMs);
  if (response.status !== 200) throw new Error(`${url} respondió HTTP ${response.status}`);
  const body = await response.json().catch(() => null);
  if (body?.status !== expectedStatus) {
    throw new Error(`${url} no devolvió el estado "${expectedStatus}"`);
  }
  return response;
}

async function runSmokeChecks({
  frontendUrl,
  backendUrl,
  fetchImpl = fetch,
  timeoutMs = 10000,
}) {
  const results = [];
  const frontendResponse = await checkedFetch(fetchImpl, `${frontendUrl}/`, timeoutMs);
  if (!frontendResponse.ok) throw new Error(`${frontendUrl}/ respondió HTTP ${frontendResponse.status}`);
  if (!frontendResponse.headers.get("content-type")?.includes("text/html")) {
    throw new Error("El frontend no devolvió contenido HTML");
  }
  if (!frontendResponse.headers.get("content-security-policy")) {
    throw new Error("El frontend no incluye Content-Security-Policy");
  }
  results.push("frontend");

  await expectJsonStatus(fetchImpl, `${frontendUrl}/health`, "ok", timeoutMs);
  results.push("frontend-health");

  const healthResponse = await expectJsonStatus(fetchImpl, `${backendUrl}/health`, "ok", timeoutMs);
  if (healthResponse.headers.get("x-content-type-options") !== "nosniff") {
    throw new Error("El backend no incluye X-Content-Type-Options");
  }
  if (!healthResponse.headers.get("x-request-id")) {
    throw new Error("El backend no devolvió X-Request-Id");
  }
  results.push("backend-health");

  await expectJsonStatus(fetchImpl, `${backendUrl}/ready`, "ready", timeoutMs);
  results.push("backend-ready");

  return results;
}

module.exports = { normalizeBaseUrl, parseSmokeOptions, runSmokeChecks };
