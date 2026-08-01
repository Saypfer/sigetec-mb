const { fn, col, literal } = require("sequelize");
const { RepairOrder, InventoryItem, OrderPart, User } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const byMonth = asyncHandler(async (req, res) => {
  const rows = await RepairOrder.findAll({
    attributes: [
      [fn("to_char", col("entry_date"), "YYYY-MM"), "month"],
      [fn("COUNT", col("RepairOrder.id")), "total"],
    ],
    group: ["month"],
    order: [[literal("month"), "ASC"]],
    raw: true,
  });
  res.json(rows);
});

const byStatus = asyncHandler(async (req, res) => {
  const rows = await RepairOrder.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "total"]],
    group: ["status"],
    raw: true,
  });
  res.json(rows);
});

const byTechnician = asyncHandler(async (req, res) => {
  const rows = await RepairOrder.findAll({
    attributes: ["technicianId", [fn("COUNT", col("RepairOrder.id")), "total"]],
    include: [{ model: User, as: "technician", attributes: ["name"] }],
    group: ["technicianId", "technician.id", "technician.name"],
    raw: true,
  });
  res.json(rows);
});

const mostUsedParts = asyncHandler(async (req, res) => {
  const rows = await OrderPart.findAll({
    attributes: ["inventoryItemId", [fn("SUM", col("quantity_used")), "totalUsed"]],
    include: [{ model: InventoryItem, as: "inventoryItem", attributes: ["name", "code"] }],
    group: ["inventoryItemId", "inventoryItem.id", "inventoryItem.name", "inventoryItem.code"],
    order: [[literal('"totalUsed"'), "DESC"]],
    raw: true,
  });
  res.json(rows);
});

const lowStock = asyncHandler(async (req, res) => {
  const items = await InventoryItem.findAll({ where: { status: "Stock bajo" } });
  res.json(items);
});

const estimatedIncome = asyncHandler(async (req, res) => {
  const total = await RepairOrder.sum("cost");
  res.json({ estimatedIncome: total || 0 });
});

module.exports = { byMonth, byStatus, byTechnician, mostUsedParts, lowStock, estimatedIncome };
