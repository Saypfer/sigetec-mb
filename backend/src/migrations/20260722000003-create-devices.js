"use strict";

const ORDER_STATUSES = [
  "Pendiente",
  "En diagnóstico",
  "En reparación",
  "Esperando repuesto",
  "Finalizado",
  "Entregado",
  "Cancelado",
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("devices", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      serial: { type: Sequelize.STRING, allowNull: false, unique: true },
      type: { type: Sequelize.STRING, allowNull: false },
      brand: { type: Sequelize.STRING, allowNull: false },
      model: { type: Sequelize.STRING, allowNull: false },
      condition: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM(...ORDER_STATUSES), allowNull: false, defaultValue: "Pendiente" },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "clients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("devices");
  },
};
