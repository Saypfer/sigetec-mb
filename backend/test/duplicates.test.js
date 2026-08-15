const assert = require("node:assert/strict");
const { test } = require("node:test");

const { findCaseInsensitiveDuplicate } = require("../src/utils/duplicates");

test("no consulta el modelo cuando el valor está vacío", async () => {
  let calls = 0;
  const model = {
    async findOne() {
      calls += 1;
    },
  };

  const result = await findCaseInsensitiveDuplicate(model, "email", "");

  assert.equal(result, null);
  assert.equal(calls, 0);
});

test("consulta el modelo y devuelve el duplicado encontrado", async () => {
  const duplicate = { id: 7 };
  let receivedOptions;
  const model = {
    async findOne(options) {
      receivedOptions = options;
      return duplicate;
    },
  };

  const result = await findCaseInsensitiveDuplicate(model, "email", "  USER@EXAMPLE.COM  ", 3);

  assert.equal(result, duplicate);
  assert.ok(receivedOptions.where);

  const [andOperator] = Object.getOwnPropertySymbols(receivedOptions.where);
  assert.ok(andOperator);
  assert.equal(receivedOptions.where[andOperator].length, 2);
});
