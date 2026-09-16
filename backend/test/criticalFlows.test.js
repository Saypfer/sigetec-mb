const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const bcrypt = require("bcryptjs");
const { createTestDatabase } = require("../testSupport/createTestDatabase");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:5432/sigetec_test";
process.env.DB_SSL = "false";
process.env.JWT_SECRET = "test-secret-for-automated-tests";

let baseUrl;
let database;
let server;

async function request(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = response.status === 204 ? null : await response.json();

  return { response, payload };
}

async function login(email, password) {
  const { response, payload } = await request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  assert.equal(response.status, 200);
  return payload.token;
}

before(async () => {
  database = await createTestDatabase();

  const modelsPath = require.resolve("../src/models");
  require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: database,
    children: [],
    paths: [],
  };

  const passwordHash = await bcrypt.hash("TestPassword123!", 4);
  await database.User.bulkCreate([
    {
      name: "Administrador de prueba",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
      status: "Disponible",
    },
    {
      name: "Técnico principal",
      email: "tecnico@example.com",
      passwordHash,
      role: "tecnico",
      status: "Disponible",
    },
    {
      name: "Técnico alterno",
      email: "otro@example.com",
      passwordHash,
      role: "tecnico",
      status: "Disponible",
    },
  ]);

  const app = require("../src/app");
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  if (database) await database.sequelize.close();
});

test("roles, órdenes e inventario conservan sus reglas en el flujo crítico", async () => {
  const adminToken = await login("admin@example.com", "TestPassword123!");
  const technicianToken = await login("tecnico@example.com", "TestPassword123!");
  const otherTechnicianToken = await login("otro@example.com", "TestPassword123!");

  const deniedClient = await request("/api/clients", {
    method: "POST",
    token: technicianToken,
    body: {
      name: "Cliente no permitido",
      phone: "55551111",
      email: "denegado@example.com",
      type: "Individual",
    },
  });
  assert.equal(deniedClient.response.status, 403);

  const clientResult = await request("/api/clients", {
    method: "POST",
    token: adminToken,
    body: {
      name: "Cliente de integración",
      phone: "55551234",
      email: "cliente@example.com",
      type: "Individual",
    },
  });
  assert.equal(clientResult.response.status, 201);

  const deviceResult = await request("/api/devices", {
    method: "POST",
    token: adminToken,
    body: {
      type: "Laptop",
      brand: "Lenovo",
      model: "ThinkPad",
      condition: "Equipo completo",
      status: "Pendiente",
      clientId: clientResult.payload.id,
    },
  });
  assert.equal(deviceResult.response.status, 201);

  const inventoryResult = await request("/api/inventory", {
    method: "POST",
    token: adminToken,
    body: {
      code: "SSD-001",
      name: "Unidad SSD",
      category: "Almacenamiento",
      quantity: 5,
      minStock: 1,
      price: 350,
      location: "A-1",
    },
  });
  assert.equal(inventoryResult.response.status, 201);

  const orderResult = await request("/api/orders", {
    method: "POST",
    token: adminToken,
    body: {
      code: "ORD-001",
      clientId: clientResult.payload.id,
      deviceId: deviceResult.payload.id,
      issue: "No inicia",
      status: "Pendiente",
      entryDate: "2026-09-15",
      partsUsed: [
        { inventoryItemId: inventoryResult.payload.id, quantityUsed: 2 },
      ],
    },
  });
  assert.equal(orderResult.response.status, 201);
  assert.equal(orderResult.payload.partsUsed.length, 1);
  assert.equal(orderResult.payload.history.length, 2);

  const inventoryAfterOrder = await database.InventoryItem.findByPk(inventoryResult.payload.id);
  assert.equal(inventoryAfterOrder.quantity, 3);

  const claimResult = await request(`/api/orders/${orderResult.payload.id}/claim`, {
    method: "POST",
    token: technicianToken,
  });
  assert.equal(claimResult.response.status, 200);
  assert.equal(claimResult.payload.technician.email, "tecnico@example.com");

  const competingClaim = await request(`/api/orders/${orderResult.payload.id}/claim`, {
    method: "POST",
    token: otherTechnicianToken,
  });
  assert.equal(competingClaim.response.status, 409);

  const forbiddenUpdate = await request(`/api/orders/${orderResult.payload.id}`, {
    method: "PUT",
    token: technicianToken,
    body: { code: "ORD-MODIFICADA" },
  });
  assert.equal(forbiddenUpdate.response.status, 403);

  const validUpdate = await request(`/api/orders/${orderResult.payload.id}`, {
    method: "PUT",
    token: technicianToken,
    body: { status: "En reparación", diagnosis: "SSD defectuosa" },
  });
  assert.equal(validUpdate.response.status, 200);
  assert.equal(validUpdate.payload.status, "En reparación");
  assert.equal(validUpdate.payload.diagnosis, "SSD defectuosa");

  const ordersBeforeFailure = await database.RepairOrder.count();
  const insufficientInventory = await request("/api/orders", {
    method: "POST",
    token: adminToken,
    body: {
      code: "ORD-002",
      clientId: clientResult.payload.id,
      deviceId: deviceResult.payload.id,
      issue: "Prueba de rollback",
      status: "Pendiente",
      entryDate: "2026-09-15",
      partsUsed: [
        { inventoryItemId: inventoryResult.payload.id, quantityUsed: 4 },
      ],
    },
  });
  assert.equal(insufficientInventory.response.status, 400);
  assert.equal(await database.RepairOrder.count(), ordersBeforeFailure);

  const inventoryAfterRejection = await database.InventoryItem.findByPk(inventoryResult.payload.id);
  assert.equal(inventoryAfterRejection.quantity, 3);

  const deleteResult = await request(`/api/orders/${orderResult.payload.id}`, {
    method: "DELETE",
    token: adminToken,
  });
  assert.equal(deleteResult.response.status, 204);

  const inventoryAfterDelete = await database.InventoryItem.findByPk(inventoryResult.payload.id);
  assert.equal(inventoryAfterDelete.quantity, 5);
});
