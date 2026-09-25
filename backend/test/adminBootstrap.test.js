const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  createInitialAdmin,
  parseInitialAdminConfig,
} = require("../src/services/adminBootstrap");

const validSource = {
  INITIAL_ADMIN_NAME: "  Administrador principal  ",
  INITIAL_ADMIN_EMAIL: "  ADMIN@EXAMPLE.COM  ",
  INITIAL_ADMIN_PASSWORD: "UnaClaveSegura123!",
  INITIAL_ADMIN_PHONE: "55551234",
};

test("normaliza y valida la configuración del administrador inicial", () => {
  assert.deepEqual(parseInitialAdminConfig(validSource), {
    name: "Administrador principal",
    email: "admin@example.com",
    password: "UnaClaveSegura123!",
    phone: "55551234",
  });
});

test("rechaza una contraseña inicial débil", () => {
  assert.throws(
    () => parseInitialAdminConfig({ ...validSource, INITIAL_ADMIN_PASSWORD: "corta" }),
    /al menos 12 caracteres/
  );
});

test("crea un único administrador sin exponer la contraseña", async () => {
  const calls = [];
  const transaction = { id: "transaction" };
  const sequelize = {
    query: async (sql, options) => calls.push(["lock", sql, options]),
    transaction: async (callback) => callback(transaction),
  };
  const User = {
    count: async (options) => {
      calls.push(["count", options]);
      return 0;
    },
    findOne: async (options) => {
      calls.push(["findOne", options]);
      return null;
    },
    create: async (data, options) => {
      calls.push(["create", data, options]);
      return { id: 1, ...data };
    },
  };
  const config = parseInitialAdminConfig(validSource);

  const admin = await createInitialAdmin({
    sequelize,
    User,
    config,
    hashPassword: async () => "hash-seguro",
  });

  assert.equal(admin.email, "admin@example.com");
  assert.equal(admin.passwordHash, "hash-seguro");
  assert.equal(admin.password, undefined);
  assert.equal(admin.role, "admin");
  assert.equal(admin.status, "Disponible");
  assert.match(calls[0][1], /^LOCK TABLE/);
  assert.equal(calls.at(-1)[2].transaction, transaction);
});

test("impide repetir el comando cuando ya existe un administrador", async () => {
  let created = false;
  const sequelize = {
    query: async () => {},
    transaction: async (callback) => callback({}),
  };
  const User = {
    count: async () => 1,
    findOne: async () => null,
    create: async () => {
      created = true;
    },
  };

  await assert.rejects(
    createInitialAdmin({
      sequelize,
      User,
      config: parseInitialAdminConfig(validSource),
      hashPassword: async () => "hash-seguro",
    }),
    /Ya existe un administrador/
  );
  assert.equal(created, false);
});
