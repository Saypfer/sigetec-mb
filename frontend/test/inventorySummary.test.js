import assert from "node:assert/strict";
import { test } from "node:test";

import { getInventorySummary } from "../src/inventorySummary.js";

const items = [
  { quantity: 2, price: 100, status: "Disponible" },
  { quantity: 1, price: 50, status: "Stock bajo" },
];

test("el técnico ve las existencias sin el valor estimado", () => {
  const summary = getInventorySummary(items, false, (value) => `Q ${value}`);

  assert.deepEqual(summary, [
    ["Total repuestos", 2],
    ["Stock bajo", 1],
  ]);
});

test("el administrador conserva el valor estimado del inventario", () => {
  const summary = getInventorySummary(items, true, (value) => `Q ${value}`);

  assert.deepEqual(summary, [
    ["Total repuestos", 2],
    ["Stock bajo", 1],
    ["Valor estimado", "Q 250"],
  ]);
});
