const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { nodeFileTrace } = require("@vercel/nft");

test("el paquete serverless arranca sin depender de node_modules locales", { timeout: 60000 }, async () => {
  const backendRoot = path.resolve(__dirname, "..");
  const { fileList } = await nodeFileTrace([path.join(backendRoot, "index.js")], {
    base: backendRoot,
    processCwd: backendRoot,
    ignore: ["**/.env", "**/.env.*"],
  });
  const bundleRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sigetec-serverless-test-"));

  try {
    // Copiar exclusivamente lo que Vercel detecta; no compartir node_modules
    // con el proyecto, pues eso ocultaria dependencias ausentes del paquete.
    for (const file of fileList) {
      const destination = path.resolve(bundleRoot, file);
      assert.ok(destination.startsWith(`${bundleRoot}${path.sep}`));
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(path.join(backendRoot, file), destination);
    }

    const child = spawnSync(process.execPath, ["-e", `
      const assert = require('node:assert/strict');
      const app = require('./index');
      const { sequelize } = require('./src/models');
      const server = app.listen(0, '127.0.0.1', async () => {
        try {
          const baseUrl = 'http://127.0.0.1:' + server.address().port;
          const response = await fetch(baseUrl + '/health');
          assert.equal(response.status, 200);
          assert.deepEqual(await response.json(), { status: 'ok' });
          const login = await fetch(baseUrl + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
          });
          assert.equal(login.status, 400);
        } catch (error) {
          console.error(error);
          process.exitCode = 1;
        } finally {
          await new Promise(resolve => server.close(resolve));
          await sequelize.close();
        }
      });
      server.on('error', error => { console.error(error); process.exitCode = 1; });
    `], {
      cwd: bundleRoot,
      env: {
        ...process.env,
        NODE_ENV: "production",
        NODE_PATH: "",
        NODE_OPTIONS: "",
        DATABASE_URL: "postgres://test:test@127.0.0.1:5432/sigetec_bundle_test",
        DB_SSL: "false",
        JWT_SECRET: "serverless-bundle-test-secret-at-least-32-characters",
        JWT_EXPIRES_IN: "8h",
        CORS_ORIGIN: "https://example.com",
        TRUST_PROXY_HOPS: "1",
        PORT: "4000",
        HOST: "127.0.0.1",
        SHUTDOWN_TIMEOUT_MS: "10000",
      },
      encoding: "utf8",
      timeout: 15000,
    });

    assert.ifError(child.error);
    assert.equal(child.status, 0, `El paquete no pudo arrancar:\n${child.stderr}\n${child.stdout}`);
  } finally {
    assert.equal(path.dirname(bundleRoot), path.resolve(os.tmpdir()));
    assert.ok(path.basename(bundleRoot).startsWith("sigetec-serverless-test-"));
    await fs.rm(bundleRoot, { recursive: true, force: true });
  }
});
