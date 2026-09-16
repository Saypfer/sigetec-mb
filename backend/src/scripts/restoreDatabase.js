const path = require("node:path");
const { access, readFile } = require("node:fs/promises");
require("dotenv").config();
const {
  assertRestoreConfirmation,
  buildRestoreArguments,
  calculateChecksum,
  parseChecksum,
  parseCommandOptions,
  parseDatabaseConnection,
  runPostgresTool,
} = require("../utils/postgresBackup");

async function run() {
  const options = parseCommandOptions(process.argv.slice(2), {
    values: ["file", "confirm-database"],
    flags: ["clean"],
  });
  if (!options.file) throw new Error("--file es requerido");

  const archivePath = path.resolve(options.file);
  const checksumPath = `${archivePath}.sha256`;
  await access(archivePath);
  await access(checksumPath).catch(() => {
    throw new Error(`Falta el checksum requerido: ${checksumPath}`);
  });

  const connection = parseDatabaseConnection(process.env.DATABASE_URL);
  assertRestoreConfirmation(connection.databaseName, options["confirm-database"]);

  const expectedChecksum = parseChecksum(await readFile(checksumPath, "utf8"));
  const actualChecksum = await calculateChecksum(archivePath);
  if (actualChecksum !== expectedChecksum) {
    throw new Error("El respaldo no coincide con su checksum; la restauración fue cancelada");
  }

  await runPostgresTool("pg_restore", ["--list", archivePath], {
    env: connection.env,
    quiet: true,
  });
  await runPostgresTool(
    "pg_restore",
    buildRestoreArguments(archivePath, connection.databaseName, { clean: options.clean }),
    { env: connection.env }
  );

  console.log(`Restauración completada en la base ${connection.databaseName}`);
}

run().catch((error) => {
  console.error(`No se pudo restaurar el respaldo: ${error.message}`);
  process.exitCode = 1;
});
