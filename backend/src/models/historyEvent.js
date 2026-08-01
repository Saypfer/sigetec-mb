module.exports = (sequelize, DataTypes) => {
  const HistoryEvent = sequelize.define(
    "HistoryEvent",
    {
      orderId: { type: DataTypes.INTEGER, allowNull: false, field: "order_id" },
      event: { type: DataTypes.STRING, allowNull: false },
      authorId: { type: DataTypes.INTEGER, allowNull: true, field: "author_id" },
      detail: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "history_events" }
  );

  HistoryEvent.associate = (models) => {
    HistoryEvent.belongsTo(models.RepairOrder, { foreignKey: "orderId", as: "order" });
    HistoryEvent.belongsTo(models.User, { foreignKey: "authorId", as: "author" });
  };

  return HistoryEvent;
};
