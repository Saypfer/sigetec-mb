const { ORDER_STATUSES } = require("../constants/statuses");

module.exports = (sequelize, DataTypes) => {
  const RepairOrder = sequelize.define(
    "RepairOrder",
    {
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      clientId: { type: DataTypes.INTEGER, allowNull: false, field: "client_id" },
      deviceId: { type: DataTypes.INTEGER, allowNull: false, field: "device_id" },
      issue: { type: DataTypes.TEXT, allowNull: true },
      diagnosis: { type: DataTypes.TEXT, allowNull: true },
      technicianId: { type: DataTypes.INTEGER, allowNull: true, field: "technician_id" },
      status: {
        type: DataTypes.ENUM(...ORDER_STATUSES),
        allowNull: false,
        defaultValue: "Pendiente",
      },
      entryDate: { type: DataTypes.DATEONLY, allowNull: false, field: "entry_date" },
      deliveryDate: { type: DataTypes.DATEONLY, allowNull: true, field: "delivery_date" },
      cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "repair_orders" }
  );

  RepairOrder.associate = (models) => {
    RepairOrder.belongsTo(models.Client, { foreignKey: "clientId", as: "client" });
    RepairOrder.belongsTo(models.Device, { foreignKey: "deviceId", as: "device" });
    RepairOrder.belongsTo(models.User, { foreignKey: "technicianId", as: "technician" });
    RepairOrder.hasMany(models.OrderPart, { foreignKey: "orderId", as: "partsUsed" });
    RepairOrder.hasMany(models.HistoryEvent, { foreignKey: "orderId", as: "history" });
  };

  return RepairOrder;
};
