const { RepairOrder, InventoryItem, Client, Device, User } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const summary = asyncHandler(async (req, res) => {
  const [total, pending, inRepair, finished, lowStockItems, recentOrders] = await Promise.all([
    RepairOrder.count(),
    RepairOrder.count({ where: { status: "Pendiente" } }),
    RepairOrder.count({ where: { status: "En reparación" } }),
    RepairOrder.count({ where: { status: ["Finalizado", "Entregado"] } }),
    InventoryItem.findAll({ where: { status: "Stock bajo" } }),
    RepairOrder.findAll({
      include: [
        { model: Client, as: "client" },
        { model: Device, as: "device" },
        { model: User, as: "technician", attributes: ["id", "name", "email", "role", "status"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ]);

  res.json({
    totalOrders: total,
    pendingOrders: pending,
    inRepairOrders: inRepair,
    finishedOrders: finished,
    lowStockCount: lowStockItems.length,
    lowStockItems,
    recentOrders,
  });
});

module.exports = { summary };
