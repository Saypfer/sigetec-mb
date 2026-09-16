const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDirectory = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function readApiUrl(argv) {
  const inline = argv.find((argument) => argument.startsWith("--api-url="));
  const index = argv.indexOf("--api-url");
  const value = inline?.slice("--api-url=".length) || (index >= 0 ? argv[index + 1] : null);
  return String(value || process.env.VITE_API_URL || "").trim();
}

function validateApiUrl(value) {
  if (!value) throw new Error("Indica --api-url o define VITE_API_URL");

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("La URL pública del API no es válida");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("La URL pública del API debe usar HTTP/HTTPS y no contener credenciales");
  }
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !isLocal) {
    throw new Error("La URL pública del API debe usar HTTPS fuera del entorno local");
  }
  return url.toString().replace(/\/$/, "");
}

function runStep(name, directory, args, extraEnv = {}) {
  console.log(`\n[preflight] ${name}`);
  const result = spawnSync(npmCommand, args, {
    cwd: path.join(rootDirectory, directory),
    env: { ...process.env, ...extraEnv },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${name} falló con código ${result.status}`);
}

function run() {
  const apiUrl = validateApiUrl(readApiUrl(process.argv.slice(2)));
  const steps = [
    ["Pruebas del backend", "backend", ["test"]],
    ["Auditoría del backend", "backend", ["audit", "--omit=dev", "--audit-level=high"]],
    ["Pruebas del frontend", "frontend", ["test"]],
    ["Auditoría del frontend", "frontend", ["audit", "--omit=dev", "--audit-level=high"]],
    ["Compilación y presupuesto del frontend", "frontend", ["run", "build:check"], { VITE_API_URL: apiUrl }],
  ];

  for (const [name, directory, args, env] of steps) runStep(name, directory, args, env);
  console.log("\n[preflight] Todas las verificaciones finalizaron correctamente.");
}

try {
  run();
} catch (error) {
  console.error(`\n[preflight] ${error.message}`);
  process.exitCode = 1;
}
