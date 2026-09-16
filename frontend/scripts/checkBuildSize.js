import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const assetsDirectory = new URL("../dist/assets/", import.meta.url);
const budgets = {
  ".js": 120 * 1024,
  ".css": 15 * 1024,
};

const files = readdirSync(assetsDirectory);
let failed = false;

for (const [extension, maximumBytes] of Object.entries(budgets)) {
  const matchingFiles = files.filter((file) => file.endsWith(extension));
  if (matchingFiles.length === 0) {
    throw new Error(`No se encontraron archivos ${extension} en la compilación`);
  }

  const gzipBytes = matchingFiles.reduce((total, file) => {
    const contents = readFileSync(new URL(file, assetsDirectory));
    return total + gzipSync(contents).byteLength;
  }, 0);
  const usedKb = (gzipBytes / 1024).toFixed(2);
  const maximumKb = (maximumBytes / 1024).toFixed(0);

  console.log(`${extension}: ${usedKb} KB gzip de ${maximumKb} KB permitidos`);
  if (gzipBytes > maximumBytes) failed = true;
}

if (failed) {
  throw new Error("La compilación supera el presupuesto de rendimiento");
}
