const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  assertRestoreConfirmation,
  buildBackupArguments,
  buildRestoreArguments,
  parseChecksum,
  parseCommandOptions,
  parseDatabaseConnection,
} = require("../src/utils/postgresBackup");

test("convierte DATABASE_URL en variables seguras para las herramientas PostgreSQL", () => {
  const databaseUrl =
    "postgresql://usuario:clave%40segura@db.example.com:5433/sigetec?sslmode=require&connect_timeout=8";
  const connection = parseDatabaseConnection(databaseUrl, {
    PATH: "ruta-binarios",
    DATABASE_URL: databaseUrl,
    JWT_SECRET: "secreto-jwt",
  });

  assert.equal(connection.databaseName, "sigetec");
  assert.equal(connection.env.PGHOST, "db.example.com");
  assert.equal(connection.env.PGPORT, "5433");
  assert.equal(connection.env.PGUSER, "usuario");
  assert.equal(connection.env.PGPASSWORD, "clave@segura");
  assert.equal(connection.env.PGSSLMODE, "require");
  assert.equal(connection.env.PGCONNECT_TIMEOUT, "8");
  assert.equal(connection.env.PATH, "ruta-binarios");
  assert.equal(connection.env.DATABASE_URL, undefined);
  assert.equal(connection.env.JWT_SECRET, undefined);
});

test("los argumentos de respaldo no contienen credenciales", () => {
  const args = buildBackupArguments("C:/respaldos/sigetec.dump");

  assert.deepEqual(args, [
    "--format=custom",
    "--compress=9",
    "--no-owner",
    "--no-privileges",
    "--file=C:/respaldos/sigetec.dump",
  ]);
  assert.doesNotMatch(args.join(" "), /usuario|contraseña|postgres:/);
});

test("la restauración exige confirmar exactamente la base de destino", () => {
  assert.doesNotThrow(() => assertRestoreConfirmation("sigetec", "sigetec"));
  assert.throws(
    () => assertRestoreConfirmation("sigetec", "otra-base"),
    /--confirm-database=sigetec/
  );
});

test("la limpieza de restauración solo se agrega cuando fue solicitada", () => {
  const safeArgs = buildRestoreArguments("sigetec.dump", "sigetec");
  const cleanArgs = buildRestoreArguments("sigetec.dump", "sigetec", { clean: true });

  assert.equal(safeArgs.includes("--clean"), false);
  assert.deepEqual(cleanArgs.slice(4, 6), ["--clean", "--if-exists"]);
});

test("valida opciones y checksums antes de ejecutar herramientas externas", () => {
  assert.deepEqual(
    parseCommandOptions(
      ["--file=respaldo.dump", "--confirm-database", "sigetec", "--clean"],
      { values: ["file", "confirm-database"], flags: ["clean"] }
    ),
    { file: "respaldo.dump", "confirm-database": "sigetec", clean: true }
  );
  assert.equal(parseChecksum(`${"a".repeat(64)}  sigetec.dump\n`), "a".repeat(64));
  assert.throws(
    () => parseCommandOptions(["--desconocida"], { values: [], flags: [] }),
    /Opción no reconocida/
  );
  assert.throws(() => parseChecksum("checksum-inválido"), /formato SHA-256 válido/);
});
