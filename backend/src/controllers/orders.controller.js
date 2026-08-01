const { sequelize, RepairOrder, Client, Device, User, OrderPart, InventoryItem, HistoryEvent } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const include = [
  { model: Client, as: "client" },
  { model: Device, as: "device" },
  { model: User, as: "technician", attributes: { exclude: ["passwordHash"] } },
  { model: OrderPart, as: "partsUsed", include: [{ model: InventoryItem, as: "inventoryItem" }] },
];

const list = asyncHandler(async (req, res) => {
  const orders = await RepairOrder.findAll({ include, order: [["createdAt", "DESC"]] });
  res.json(orders);
});

const get = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id, { include });
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });
  res.json(order);
});

const create = asyncHandler(async (req, res) => {
  const order = await RepairOrder.create(req.body);
  await HistoryEvent.create({
    orderId: order.id,
    event: "Orden creada",
    authorId: req.user.id,
    detail: `Equipo recibido para evaluación.`,
  });
  const created = await RepairOrder.findByPk(order.id, { include });
  res.status(201).json(created);
});

const update = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });

  const previousStatus = order.status;
  await order.update(req.body);

  if (req.body.status && req.body.status !== previousStatus) {
    await HistoryEvent.create({
      orderId: order.id,
      event: `Estado actualizado a "${req.body.status}"`,
      authorId: req.user.id,
      detail: `Cambió de "${previousStatus}" a "${req.body.status}".`,
    });
  }

  const updated = await RepairOrder.findByPk(order.id, { include });
  res.json(updated);
});

const remove = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });
  await order.destroy();
  res.status(204).send();
});

const addPart = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });

  const { inventoryItemId, quantityUsed } = req.body;
  const item = await InventoryItem.findByPk(inventoryItemId);
  if (!item) return res.status(404).json({ message: "Repuesto no encontrado" });
  if (item.quantity < quantityUsed) {
    return res.status(400).json({ message: "Existencia insuficiente para este repuesto" });
  }

  const result = await sequelize.transaction(async (t) => {
    const part = await OrderPart.create(
      { orderId: order.id, inventoryItemId, quantityUsed },
      { transaction: t }
    );
    item.quantity -= quantityUsed;
    await item.save({ transaction: t });
    await HistoryEvent.create(
      {
        orderId: order.id,
        event: "Repuesto asignado",
        authorId: req.user.id,
        detail: `${item.name} descontado del inventario (${quantityUsed}).`,
      },
      { transaction: t }
    );
    return part;
  });

  res.status(201).json(result);
});

const addObservation = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });

  const { detail } = req.body;
  if (!detail) return res.status(400).json({ message: "La observación no puede estar vacía" });

  const event = await HistoryEvent.create({
    orderId: order.id,
    event: "Observación técnica",
    authorId: req.user.id,
    detail,
  });

  res.status(201).json(event);
});

module.exports = { list, get, create, update, remove, addPart, addObservation };
