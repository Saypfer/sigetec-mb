module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define(
    "Client",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
      type: {
        type: DataTypes.ENUM("Individual", "Empresa"),
        allowNull: false,
        defaultValue: "Individual",
      },
    },
    { tableName: "clients" }
  );

  Client.associate = (models) => {
    Client.hasMany(models.Device, { foreignKey: "clientId", as: "devices" });
    Client.hasMany(models.RepairOrder, { foreignKey: "clientId", as: "orders" });
  };

  return Client;
};
