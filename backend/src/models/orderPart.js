module.exports = (sequelize, DataTypes) => {
  const OrderPart = sequelize.define(
    "OrderPart",
    {
      orderId: { type: DataTypes.INTEGER, allowNull: false, field: "order_id" },
      inventoryItemId: { type: DataTypes.INTEGER, allowNull: false, field: "inventory_item_id" },
      quantityUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: "quantity_used",
      },
    },
    { tableName: "order_parts" }
  );

  OrderPart.associate = (models) => {
    OrderPart.belongsTo(models.RepairOrder, { foreignKey: "orderId", as: "order" });
    OrderPart.belongsTo(models.InventoryItem, { foreignKey: "inventoryItemId", as: "inventoryItem" });
  };

  return OrderPart;
};
