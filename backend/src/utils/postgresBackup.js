const { createHash } = require("node:crypto");
const { createReadStream } = require("node:fs");
const { spawn } = require("node:child_process");

const PASSTHROUGH_ENV_NAMES = new Set([
  "comspec",
  "home",
  "lang",
  "ld_library_path",
  "path",
  "pathext",
  "systemroot",
  "temp",
  "tmp",
  "tmpdir",
  "userprofile",
  "windir",
]);

function decodeUrlPart(value, label) {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Error(`DATABASE_URL contiene un ${label} inválido`);
  }
}

function parseDatabaseConnection(databaseUrl, baseEnv = process.env) {
  let url;
  try {
    url = new URL(String(databaseUrl ?? ""));
  } catch {
    throw new Error("DATABASE_URL debe ser una URL válida de PostgreSQL");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL debe utilizar el protocolo postgres o postgresql");
  }

  const databaseName = decodeUrlPart(url.pathname.replace(/^\//, ""), "nombre de base de datos");
  const username = decodeUrlPart(url.username, "usuario");
  const password = decodeUrlPart(url.password, "contraseña");
  if (!url.hostname || !databaseName || !username) {
    throw new Error("DATABASE_URL debe incluir host, usuario y nombre de base de datos");
  }

  const env = Object.fromEntries(
    Object.entries(baseEnv).filter(([name]) => {
      const normalizedName = name.toLowerCase();
      return PASSTHROUGH_ENV_NAMES.has(normalizedName) || normalizedName.startsWith("lc_");
    })
  );

  Object.assign(env, {
    PGHOST: url.hostname.replace(/^\[|\]$/g, ""),
    PGPORT: url.port || "5432",
    PGUSER: username,
    PGPASSWORD: password,
    PGDATABASE: databaseName,
  });

  const parameterMapping = {
    application_name: "PGAPPNAME",
    channel_binding: "PGCHANNELBINDING",
    connect_timeout: "PGCONNECT_TIMEOUT",
    sslcert: "PGSSLCERT",
    sslkey: "PGSSLKEY",
    sslmode: "PGSSLMODE",
    sslrootcert: "PGSSLROOTCERT",
  };
  for (const [parameter, environmentName] of Object.entries(parameterMapping)) {
    const value = url.searchParams.get(parameter);
    if (value) env[environmentName] = value;
  }

  return { databaseName, env };
}

function parseCommandOptions(argv, { values = [], flags = [] }) {
  const valueOptions = new Set(values);
  const flagOptions = new Set(flags);
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) throw new Error(`Argumento no reconocido: ${argument}`);

    const separatorIndex = argument.indexOf("=");
    const name = argument.slice(2, separatorIndex === -1 ? undefined : separatorIndex);
    const inlineValue = separatorIndex === -1 ? undefined : argument.slice(separatorIndex + 1);

    if (flagOptions.has(name)) {
      if (inlineValue !== undefined) throw new Error(`--${name} no recibe un valor`);
      options[name] = true;
      continue;
    }
    if (!valueOptions.has(name)) throw new Error(`Opción no reconocida: --${name}`);

    const value = inlineValue ?? argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`--${name} requiere un valor`);
    if (Object.prototype.hasOwnProperty.call(options, name)) {
      throw new Error(`--${name} no puede repetirse`);
    }
    options[name] = value;
  }

  return options;
}

function buildBackupArguments(outputPath) {
  return [
    "--format=custom",
    "--compress=9",
    "--no-owner",
    "--no-privileges",
    `--file=${outputPath}`,
  ];
}

function buildRestoreArguments(archivePath, databaseName, { clean = false } = {}) {
  return [
    "--exit-on-error",
    "--single-transaction",
    "--no-owner",
    "--no-privileges",
    ...(clean ? ["--clean", "--if-exists"] : []),
    `--dbname=${databaseName}`,
    archivePath,
  ];
}

function assertRestoreConfirmation(databaseName, confirmation) {
  if (confirmation !== databaseName) {
    throw new Error(
      `Confirma el destino con --confirm-database=${databaseName}; la restauración modifica datos`
    );
  }
}

function parseChecksum(contents) {
  const match = String(contents).trim().match(/^([a-f\d]{64})(?:\s|$)/i);
  if (!match) throw new Error("El archivo de checksum no tiene un formato SHA-256 válido");
  return match[1].toLowerCase();
}

function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const input = createReadStream(filePath);
    input.on("error", reject);
    input.on("data", (chunk) => hash.update(chunk));
    input.on("end", () => resolve(hash.digest("hex")));
  });
}

function runPostgresTool(command, args, { env, quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ["ignore", quiet ? "ignore" : "inherit", "inherit"],
      windowsHide: true,
    });

    child.once("error", (error) => {
      if (error.code === "ENOENT") {
        reject(new Error(`${command} no está instalado o no se encuentra en PATH`));
      } else {
        reject(error);
      }
    });
    child.once("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} terminó con código ${code}`));
    });
  });
}

module.exports = {
  assertRestoreConfirmation,
  buildBackupArguments,
  buildRestoreArguments,
  calculateChecksum,
  parseChecksum,
  parseCommandOptions,
  parseDatabaseConnection,
  runPostgresTool,
};
