require("dotenv").config();

const VALID_NODE_ENVS = new Set(["development", "test", "production"]);

function required(source, name) {
  const value = String(source[name] ?? "").trim();
  if (!value) throw new Error(`La variable ${name} es requerida`);
  return value;
}

function parseBoolean(source, name, defaultValue) {
  const rawValue = source[name];
  if (rawValue === undefined || rawValue === "") return defaultValue;
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;
  throw new Error(`${name} debe ser "true" o "false"`);
}

function parsePort(source) {
  const port = Number(source.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535");
  }
  return port;
}

function parseDatabaseUrl(source) {
  const value = required(source, "DATABASE_URL");
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL debe ser una URL válida de PostgreSQL");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL debe utilizar el protocolo postgres o postgresql");
  }
  return value;
}

function parseCorsOrigins(source, nodeEnv) {
  const rawValue = String(source.CORS_ORIGIN ?? "").trim();
  if (!rawValue && nodeEnv === "production") {
    throw new Error("La variable CORS_ORIGIN es requerida en producción");
  }

  const origins = (rawValue || "http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of origins) {
    let url;
    try {
      url = new URL(origin);
    } catch {
      throw new Error(`CORS_ORIGIN contiene un origen inválido: ${origin}`);
    }
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== origin) {
      throw new Error(`CORS_ORIGIN contiene un origen inválido: ${origin}`);
    }
  }

  return origins;
}

function parseTrustProxy(source) {
  const rawValue = String(source.TRUST_PROXY_HOPS ?? "").trim();
  if (!rawValue) return false;
  const hops = Number(rawValue);
  if (!Number.isInteger(hops) || hops < 1) {
    throw new Error("TRUST_PROXY_HOPS debe ser un número entero mayor que cero");
  }
  return hops;
}

function buildConfig(source) {
  const nodeEnv = String(source.NODE_ENV || "development").trim();
  if (!VALID_NODE_ENVS.has(nodeEnv)) {
    throw new Error("NODE_ENV debe ser development, test o production");
  }

  const jwtSecret = required(source, "JWT_SECRET");
  if (jwtSecret === "change-me-in-production") {
    throw new Error("JWT_SECRET conserva el valor inseguro del archivo de ejemplo");
  }
  if (nodeEnv === "production" && jwtSecret.length < 32) {
    throw new Error("JWT_SECRET debe contener al menos 32 caracteres en producción");
  }

  const jwtExpiresIn = String(source.JWT_EXPIRES_IN || "8h").trim();
  if (!/^\d+[smhd]$/.test(jwtExpiresIn)) {
    throw new Error("JWT_EXPIRES_IN debe usar un formato como 30m, 8h o 7d");
  }

  return Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === "production",
    port: parsePort(source),
    databaseUrl: parseDatabaseUrl(source),
    dbSsl: parseBoolean(source, "DB_SSL", true),
    jwtSecret,
    jwtExpiresIn,
    corsOrigins: Object.freeze(parseCorsOrigins(source, nodeEnv)),
    trustProxy: parseTrustProxy(source),
  });
}

const env = buildConfig(process.env);

module.exports = { buildConfig, env };
