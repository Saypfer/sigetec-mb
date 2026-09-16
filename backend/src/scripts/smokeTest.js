const { parseSmokeOptions, runSmokeChecks } = require("../utils/smokeChecks");

async function run() {
  const options = parseSmokeOptions(process.argv.slice(2));
  const results = await runSmokeChecks(options);
  for (const result of results) console.log(`OK: ${result}`);
  console.log("Prueba de humo completada correctamente");
}

run().catch((error) => {
  console.error(`La prueba de humo falló: ${error.message}`);
  process.exitCode = 1;
});
