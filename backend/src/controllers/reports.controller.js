const { fn, col, literal, Op } = require("sequelize");
const { RepairOrder, InventoryItem, OrderPart, User } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const summary = asyncHandler(async (req, res) => {
  const { from, to, technicianId, status } = req.query;
  const where = {};

  if (from && to) where.entryDate = { [Op.between]: [from, to] };
  else if (from) where.entryDate = { [Op.gte]: from };
  else if (to) where.entryDate = { [Op.lte]: to };
  if (technicianId) where.technicianId = technicianId;
  if (status) where.status = status;

  const orders = await RepairOrder.findAll({
    where,
    attributes: ["id", "entryDate", "status", "cost", "technicianId"],
    include: [{ model: User, as: "technician", attributes: ["id", "name"] }],
    order: [["entryDate", "ASC"]],
  });

  const orderIds = orders.map((order) => order.id);
  const parts = orderIds.length
    ? await OrderPart.findAll({
        where: { orderId: { [Op.in]: orderIds } },
        attributes: ["inventoryItemId", "quantityUsed"],
        include: [{ model: InventoryItem, as: "inventoryItem", attributes: ["id", "name", "code", "price"] }],
      })
    : [];
  const lowStock = await InventoryItem.findAll({
    where: { status: "Stock bajo" },
    attributes: ["id", "code", "name", "quantity", "minStock"],
    order: [["quantity", "ASC"]],
  });

  const months = new Map();
  const statuses = new Map();
  const technicians = new Map();
  let estimatedIncome = 0;
  let completedOrders = 0;

  for (const order of orders) {
    const income = Number(order.cost || 0);
    const month = String(order.entryDate).slice(0, 7);
    const monthRow = months.get(month) || { month, total: 0, income: 0 };
    monthRow.total += 1;
    monthRow.income = roundMoney(monthRow.income + income);
    months.set(month, monthRow);

    statuses.set(order.status, (statuses.get(order.status) || 0) + 1);

    const technicianKey = order.technicianId || "unassigned";
    const technicianRow = technicians.get(technicianKey) || {
      technicianId: order.technicianId,
      name: order.technician?.name || "Sin asignar",
      total: 0,
      income: 0,
    };
    technicianRow.total += 1;
    technicianRow.income = roundMoney(technicianRow.income + income);
    technicians.set(technicianKey, technicianRow);

    estimatedIncome += income;
    if (["Finalizado", "Entregado"].includes(order.status)) completedOrders += 1;
  }

  const partsByItem = new Map();
  let partsCost = 0;
  for (const part of parts) {
    const quantity = Number(part.quantityUsed || 0);
    const unitCost = Number(part.inventoryItem?.price || 0);
    const totalCost = roundMoney(quantity * unitCost);
    const itemKey = part.inventoryItemId;
    const itemRow = partsByItem.get(itemKey) || {
      inventoryItemId: itemKey,
      name: part.inventoryItem?.name || "Repuesto eliminado",
      code: part.inventoryItem?.code || "Sin código",
      totalUsed: 0,
      totalCost: 0,
    };
    itemRow.totalUsed += quantity;
    itemRow.totalCost = roundMoney(itemRow.totalCost + totalCost);
    partsByItem.set(itemKey, itemRow);
    partsCost += totalCost;
  }

  estimatedIncome = roundMoney(estimatedIncome);
  partsCost = roundMoney(partsCost);

  res.json({
    filters: {
      from: from || null,
      to: to || null,
      technicianId: technicianId ? Number(technicianId) : null,
      status: status || null,
    },
    indicators: {
      totalOrders: orders.length,
      completedOrders,
      estimatedIncome,
      partsCost,
      estimatedProfit: roundMoney(estimatedIncome - partsCost),
      averageTicket: orders.length ? roundMoney(estimatedIncome / orders.length) : 0,
    },
    byMonth: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
    byStatus: [...statuses.entries()].map(([statusName, total]) => ({ status: statusName, total })),
    byTechnician: [...technicians.values()].sort((a, b) => b.total - a.total),
    mostUsedParts: [...partsByItem.values()].sort((a, b) => b.totalUsed - a.totalUsed),
    lowStock,
  });
});

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

module.exports = { summary, byMonth, byStatus, byTechnician, mostUsedParts, lowStock, estimatedIncome };
