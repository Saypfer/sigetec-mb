const { InventoryItem } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

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
  const item = await InventoryItem.create(req.body);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Repuesto no encontrado" });
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
