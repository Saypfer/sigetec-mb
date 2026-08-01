const { ORDER_STATUSES } = require("../constants/statuses");

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define(
    "Device",
    {
      serial: { type: DataTypes.STRING, allowNull: false, unique: true },
      type: { type: DataTypes.STRING, allowNull: false },
      brand: { type: DataTypes.STRING, allowNull: false },
      model: { type: DataTypes.STRING, allowNull: false },
      condition: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM(...ORDER_STATUSES),
        allowNull: false,
        defaultValue: "Pendiente",
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "client_id",
      },
    },
    { tableName: "devices" }
  );

  Device.associate = (models) => {
    Device.belongsTo(models.Client, { foreignKey: "clientId", as: "owner" });
    Device.hasMany(models.RepairOrder, { foreignKey: "deviceId", as: "orders" });
  };

  return Device;
};
