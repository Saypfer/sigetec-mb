module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING(8), allowNull: true },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "password_hash",
      },
      role: {
        type: DataTypes.ENUM("admin", "tecnico"),
        allowNull: false,
        defaultValue: "tecnico",
      },
      status: {
        type: DataTypes.ENUM("Disponible", "Ocupada"),
        allowNull: false,
        defaultValue: "Disponible",
      },
      lastAccess: { type: DataTypes.DATE, allowNull: true, field: "last_access" },
    },
    { tableName: "users" }
  );

  User.associate = (models) => {
    User.hasMany(models.RepairOrder, { foreignKey: "technicianId", as: "assignedOrders" });
    User.hasMany(models.HistoryEvent, { foreignKey: "authorId", as: "historyEvents" });
  };

  return User;
};
