const { InventoryItem } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");
const { findCaseInsensitiveDuplicate } = require("../utils/duplicates");

async function ensureUniqueCode(code, excludeId = null) {
  const duplicate = await findCaseInsensitiveDuplicate(InventoryItem, "code", code, excludeId);
  if (duplicate) {
    const error = new Error("Ya existe un repuesto con este código");
    error.status = 409;
    throw error;
  }
}

const list = asyncHandler(async (req, res) => {
  const items = await InventoryItem.findAll({ order: [["code", "ASC"]] });
  res.json(items);
});

const get = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Repuesto no encontrado" });
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  await ensureUniqueCode(req.body.code);
  const item = await InventoryItem.create(req.body);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Repuesto no encontrado" });
  await ensureUniqueCode(req.body.code, item.id);
  await item.update(req.body);
  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Repuesto no encontrado" });
  await item.destroy();
  res.status(204).send();
});

module.exports = { list, get, create, update, remove };
