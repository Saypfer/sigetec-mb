const path = require("node:path");
const { access, mkdir, unlink, writeFile } = require("node:fs/promises");
require("dotenv").config();
const {
  buildBackupArguments,
  calculateChecksum,
  parseCommandOptions,
  parseDatabaseConnection,
  runPostgresTool,
} = require("../utils/postgresBackup");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function defaultOutputPath() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve("backups", `sigetec-${timestamp}.dump`);
}

async function run() {
  const options = parseCommandOptions(process.argv.slice(2), { values: ["output"] });
  const outputPath = path.resolve(options.output || defaultOutputPath());
  const checksumPath = `${outputPath}.sha256`;

  if ((await exists(outputPath)) || (await exists(checksumPath))) {
    throw new Error("El respaldo de destino ya existe; utiliza un nombre nuevo para no sobrescribirlo");
  }

  const connection = parseDatabaseConnection(process.env.DATABASE_URL);
  await mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await runPostgresTool("pg_dump", buildBackupArguments(outputPath), {
      env: connection.env,
    });
    const checksum = await calculateChecksum(outputPath);
    await writeFile(checksumPath, `${checksum}  ${path.basename(outputPath)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    await unlink(outputPath).catch(() => {});
    await unlink(checksumPath).catch(() => {});
    throw error;
  }

  console.log(`Respaldo creado: ${outputPath}`);
  console.log(`Checksum creado: ${checksumPath}`);
}

run().catch((error) => {
  console.error(`No se pudo crear el respaldo: ${error.message}`);
  process.exitCode = 1;
});
