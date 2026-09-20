import assert from "node:assert/strict";
import { test } from "node:test";

import { getCompletedOrders } from "../src/completedOrders.js";

test("el historial incluye órdenes finalizadas y entregadas, ordenadas por actualización", () => {
  const orders = [
    { id: 1, status: "Finalizado", updatedAt: "2026-09-18T12:00:00Z" },
    { id: 2, status: "En reparación", updatedAt: "2026-09-19T14:00:00Z" },
    { id: 3, status: "Entregado", updatedAt: "2026-09-19T12:00:00Z" },
  ];

  assert.deepEqual(getCompletedOrders(orders).map((order) => order.id), [3, 1]);
  assert.deepEqual(orders.map((order) => order.id), [1, 2, 3]);
});
