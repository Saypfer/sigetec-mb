const { RepairOrder, InventoryItem, Client, Device, User } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const summary = asyncHandler(async (req, res) => {
  const orderScope = req.user.role === "tecnico" ? { technicianId: req.user.id } : {};
  const [total, pending, inRepair, finished, lowStockItems, recentOrders] = await Promise.all([
    RepairOrder.count({ where: orderScope }),
    RepairOrder.count({ where: { ...orderScope, status: "Pendiente" } }),
    RepairOrder.count({ where: { ...orderScope, status: "En reparación" } }),
    RepairOrder.count({ where: { ...orderScope, status: ["Finalizado", "Entregado"] } }),
    InventoryItem.findAll({ where: { status: "Stock bajo" } }),
    RepairOrder.findAll({
      where: orderScope,
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
