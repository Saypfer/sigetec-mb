const {
  sequelize,
  RepairOrder,
  Client,
  Device,
  User,
  OrderPart,
  InventoryItem,
  HistoryEvent,
} = require("../models");
const { Op } = require("sequelize");
const { asyncHandler } = require("../utils/asyncHandler");
const { findCaseInsensitiveDuplicate } = require("../utils/duplicates");

const include = [
  { model: Client, as: "client" },
  { model: Device, as: "device" },
  { model: User, as: "technician", attributes: { exclude: ["passwordHash"] } },
  { model: OrderPart, as: "partsUsed", include: [{ model: InventoryItem, as: "inventoryItem" }] },
  {
    model: HistoryEvent,
    as: "history",
    separate: true,
    include: [{ model: User, as: "author", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  },
];

const trackedFields = [
  ["code", "código"],
  ["clientId", "cliente"],
  ["deviceId", "equipo"],
  ["technicianId", "técnico asignado"],
  ["issue", "falla reportada"],
  ["diagnosis", "diagnóstico"],
  ["entryDate", "fecha de ingreso"],
  ["deliveryDate", "fecha de entrega"],
  ["cost", "costo"],
  ["notes", "notas"],
];

const technicianUpdateFields = new Set([
  "status",
  "diagnosis",
  "deliveryDate",
  "cost",
  "notes",
]);
const closedStatuses = ["Finalizado", "Entregado", "Cancelado"];

function isAdmin(req) {
  return req.user.role === "admin";
}

function canViewOrder(req, order) {
  return (
    isAdmin(req) ||
    order.technicianId === req.user.id ||
    (order.technicianId === null && !closedStatuses.includes(order.status))
  );
}

function canWorkOnOrder(req, order) {
  return isAdmin(req) || order.technicianId === req.user.id;
}

function denyOrderAccess(res) {
  return res.status(403).json({ message: "No tienes permisos sobre esta orden" });
}

async function ensureUniqueCode(code, excludeId = null) {
  const duplicate = await findCaseInsensitiveDuplicate(RepairOrder, "code", code, excludeId);
  if (duplicate) {
    const error = new Error("Ya existe una orden con este código");
    error.status = 409;
    throw error;
  }
}

async function validateOrderData(updates, currentOrder = null) {
  const clientId = updates.clientId ?? currentOrder?.clientId;
  const deviceId = updates.deviceId ?? currentOrder?.deviceId;
  const technicianId = Object.prototype.hasOwnProperty.call(updates, "technicianId")
    ? updates.technicianId
    : currentOrder?.technicianId;
  const entryDate = updates.entryDate ?? currentOrder?.entryDate;
  const deliveryDate = Object.prototype.hasOwnProperty.call(updates, "deliveryDate")
    ? updates.deliveryDate
    : currentOrder?.deliveryDate;

  if (deviceId) {
    const device = await Device.findByPk(deviceId);
    if (!device) {
      const error = new Error("El equipo seleccionado no existe");
      error.status = 400;
      throw error;
    }
    if (clientId && device.clientId !== clientId) {
      const error = new Error("El equipo no pertenece al cliente seleccionado");
      error.status = 400;
      throw error;
    }
  }

  if (technicianId) {
    const technician = await User.findByPk(technicianId);
    if (!technician || technician.role !== "tecnico") {
      const error = new Error("El técnico seleccionado no es válido");
      error.status = 400;
      throw error;
    }
  }

  if (entryDate && deliveryDate && String(deliveryDate) < String(entryDate)) {
    const error = new Error("La fecha de entrega no puede ser anterior al ingreso");
    error.status = 400;
    throw error;
  }
}

function valuesDiffer(previousValue, nextValue) {
  return String(previousValue ?? "") !== String(nextValue ?? "");
}

function fieldChanged(field, previousValue, nextValue) {
  if (field === "cost") {
    return Number(previousValue ?? 0) !== Number(nextValue ?? 0);
  }
  return valuesDiffer(previousValue, nextValue);
}

function groupRequestedParts(partsUsed = []) {
  const grouped = new Map();
  for (const part of partsUsed) {
    const inventoryItemId = Number(part.inventoryItemId);
    const quantityUsed = Number(part.quantityUsed);
    grouped.set(inventoryItemId, (grouped.get(inventoryItemId) || 0) + quantityUsed);
  }
  return [...grouped.entries()]
    .map(([inventoryItemId, quantityUsed]) => ({ inventoryItemId, quantityUsed }))
    .sort((a, b) => a.inventoryItemId - b.inventoryItemId);
}

const list = asyncHandler(async (req, res) => {
  const where = isAdmin(req)
    ? undefined
    : {
        [Op.or]: [
          { technicianId: req.user.id },
          { technicianId: null, status: { [Op.notIn]: closedStatuses } },
        ],
      };
  const orders = await RepairOrder.findAll({ where, include, order: [["createdAt", "DESC"]] });
  res.json(orders);
});

const get = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id, { include });
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });
  if (!canViewOrder(req, order)) return denyOrderAccess(res);
  res.json(order);
});

const create = asyncHandler(async (req, res) => {
  await validateOrderData(req.body);
  await ensureUniqueCode(req.body.code);
  const { partsUsed = [], ...orderData } = req.body;
  const requestedParts = groupRequestedParts(partsUsed);

  const order = await sequelize.transaction(async (transaction) => {
    const createdOrder = await RepairOrder.create(orderData, { transaction });
    await HistoryEvent.create(
      {
        orderId: createdOrder.id,
        event: "Orden creada",
        authorId: req.user.id,
        detail: "Equipo recibido para evaluación.",
      },
      { transaction }
    );

    for (const requestedPart of requestedParts) {
      const item = await InventoryItem.findByPk(requestedPart.inventoryItemId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!item) {
        const error = new Error("Uno de los repuestos seleccionados ya no existe");
        error.status = 400;
        throw error;
      }
      if (item.quantity < requestedPart.quantityUsed) {
        const error = new Error(
          `Existencia insuficiente de ${item.name}. Disponible: ${item.quantity}`
        );
        error.status = 400;
        throw error;
      }

      await OrderPart.create(
        {
          orderId: createdOrder.id,
          inventoryItemId: item.id,
          quantityUsed: requestedPart.quantityUsed,
        },
        { transaction }
      );
      item.quantity -= requestedPart.quantityUsed;
      await item.save({ transaction });
      await HistoryEvent.create(
        {
          orderId: createdOrder.id,
          event: "Repuesto asignado",
          authorId: req.user.id,
          detail: `${item.name} descontado del inventario (${requestedPart.quantityUsed}).`,
        },
        { transaction }
      );
    }

    return createdOrder;
  });

  const created = await RepairOrder.findByPk(order.id, { include });
  res.status(201).json(created);
});

const update = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });
  if (!canWorkOnOrder(req, order)) return denyOrderAccess(res);

  let updates = req.body;
  if (!isAdmin(req)) {
    const forbiddenFields = Object.keys(req.body).filter((field) => !technicianUpdateFields.has(field));
    if (forbiddenFields.length) {
      return res.status(403).json({
        message: "El técnico solo puede actualizar estado, diagnóstico, entrega, costo y notas",
      });
    }
    updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => technicianUpdateFields.has(field))
    );
  }
  await validateOrderData(updates, order);
  if (updates.code) await ensureUniqueCode(updates.code, order.id);

  const previous = order.get({ plain: true });

  await sequelize.transaction(async (transaction) => {
    await order.update(updates, { transaction });

    if (updates.status && valuesDiffer(previous.status, order.status)) {
      await HistoryEvent.create(
        {
          orderId: order.id,
          event: `Estado actualizado a "${order.status}"`,
          authorId: req.user.id,
          detail: `Cambió de "${previous.status}" a "${order.status}".`,
        },
        { transaction }
      );
    }

    const changedFields = trackedFields
      .filter(([field]) => Object.prototype.hasOwnProperty.call(updates, field))
      .filter(([field]) => fieldChanged(field, previous[field], order[field]))
      .map(([, label]) => label);

    if (changedFields.length) {
      await HistoryEvent.create(
        {
          orderId: order.id,
          event: "Datos de la orden actualizados",
          authorId: req.user.id,
          detail: `Se actualizaron: ${changedFields.join(", ")}.`,
        },
        { transaction }
      );
    }
  });

  const updated = await RepairOrder.findByPk(order.id, { include });
  res.json(updated);
});

const claim = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.id);

  await sequelize.transaction(async (transaction) => {
    const order = await RepairOrder.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!order) {
      const error = new Error("Orden no encontrada");
      error.status = 404;
      throw error;
    }
    if (order.technicianId && order.technicianId !== req.user.id) {
      const error = new Error("La orden ya fue asignada a otro técnico");
      error.status = 409;
      throw error;
    }
    if (!order.technicianId && closedStatuses.includes(order.status)) {
      const error = new Error("Una orden cerrada no puede ser tomada");
      error.status = 409;
      throw error;
    }
    if (order.technicianId === req.user.id) return;

    order.technicianId = req.user.id;
    await order.save({ transaction });
    await HistoryEvent.create(
      {
        orderId: order.id,
        event: "Orden tomada por técnico",
        authorId: req.user.id,
        detail: `${req.user.name} se asignó la orden.`,
      },
      { transaction }
    );
  });

  const claimed = await RepairOrder.findByPk(orderId, { include });
  res.json(claimed);
});

const remove = asyncHandler(async (req, res) => {
  await sequelize.transaction(async (transaction) => {
    const order = await RepairOrder.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!order) {
      const error = new Error("Orden no encontrada");
      error.status = 404;
      throw error;
    }

    const parts = await OrderPart.findAll({
      where: { orderId: order.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const quantitiesByItem = new Map();
    for (const part of parts) {
      quantitiesByItem.set(
        part.inventoryItemId,
        (quantitiesByItem.get(part.inventoryItemId) || 0) + Number(part.quantityUsed)
      );
    }

    for (const [inventoryItemId, quantity] of [...quantitiesByItem.entries()].sort((a, b) => a[0] - b[0])) {
      const item = await InventoryItem.findByPk(inventoryItemId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (item) {
        item.quantity = Number(item.quantity) + quantity;
        await item.save({ transaction });
      }
    }

    await order.destroy({ transaction });
  });
  res.status(204).send();
});

const addPart = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });
  if (!canWorkOnOrder(req, order)) return denyOrderAccess(res);

  const inventoryItemId = Number(req.body.inventoryItemId);
  const quantityUsed = Number(req.body.quantityUsed);

  if (!Number.isInteger(quantityUsed) || quantityUsed <= 0) {
    return res.status(400).json({ message: "La cantidad debe ser un entero mayor que cero" });
  }

  const result = await sequelize.transaction(async (transaction) => {
    const item = await InventoryItem.findByPk(inventoryItemId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!item) {
      const error = new Error("Repuesto no encontrado");
      error.status = 404;
      throw error;
    }
    if (item.quantity < quantityUsed) {
      const error = new Error("Existencia insuficiente para este repuesto");
      error.status = 400;
      throw error;
    }

    const part = await OrderPart.create(
      { orderId: order.id, inventoryItemId, quantityUsed },
      { transaction }
    );
    item.quantity -= quantityUsed;
    await item.save({ transaction });
    await HistoryEvent.create(
      {
        orderId: order.id,
        event: "Repuesto asignado",
        authorId: req.user.id,
        detail: `${item.name} descontado del inventario (${quantityUsed}).`,
      },
      { transaction }
    );
    return part;
  });

  res.status(201).json(result);
});

const removePart = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });
  if (!canWorkOnOrder(req, order)) return denyOrderAccess(res);

  await sequelize.transaction(async (transaction) => {
    const part = await OrderPart.findOne({
      where: { id: req.params.partId, orderId: order.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!part) {
      const error = new Error("Repuesto asignado no encontrado");
      error.status = 404;
      throw error;
    }

    const item = await InventoryItem.findByPk(part.inventoryItemId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!item) {
      const error = new Error("El repuesto ya no existe en inventario");
      error.status = 409;
      throw error;
    }

    item.quantity += part.quantityUsed;
    await item.save({ transaction });
    await part.destroy({ transaction });
    await HistoryEvent.create(
      {
        orderId: order.id,
        event: "Repuesto retirado",
        authorId: req.user.id,
        detail: `${item.name} devuelto al inventario (${part.quantityUsed}).`,
      },
      { transaction }
    );
  });

  res.status(204).send();
});

const addObservation = asyncHandler(async (req, res) => {
  const order = await RepairOrder.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: "Orden no encontrada" });
  if (!canWorkOnOrder(req, order)) return denyOrderAccess(res);

  const detail = String(req.body.detail ?? "").trim();
  if (!detail) return res.status(400).json({ message: "La observación no puede estar vacía" });

  const event = await HistoryEvent.create({
    orderId: order.id,
    event: "Observación técnica",
    authorId: req.user.id,
    detail,
  });

  res.status(201).json(event);
});

module.exports = { list, get, create, update, claim, remove, addPart, removePart, addObservation };
