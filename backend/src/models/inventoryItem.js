const { INVENTORY_STATUSES } = require("../constants/statuses");

module.exports = (sequelize, DataTypes) => {
  const InventoryItem = sequelize.define(
    "InventoryItem",
    {
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      minStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "min_stock",
      },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      location: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM(...INVENTORY_STATUSES),
        allowNull: false,
        defaultValue: "Disponible",
      },
    },
    {
      tableName: "inventory_items",
      hooks: {
        beforeSave: (item) => {
          item.status = item.quantity <= item.minStock ? "Stock bajo" : "Disponible";
        },
      },
    }
  );

  InventoryItem.associate = (models) => {
    InventoryItem.hasMany(models.OrderPart, { foreignKey: "inventoryItemId", as: "usages" });
  };

  return InventoryItem;
};
