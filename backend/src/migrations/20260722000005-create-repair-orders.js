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
    await queryInterface.createTable("repair_orders", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "clients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "devices", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      issue: { type: Sequelize.TEXT, allowNull: true },
      diagnosis: { type: Sequelize.TEXT, allowNull: true },
      technician_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      status: { type: Sequelize.ENUM(...ORDER_STATUSES), allowNull: false, defaultValue: "Pendiente" },
      entry_date: { type: Sequelize.DATEONLY, allowNull: false },
      delivery_date: { type: Sequelize.DATEONLY, allowNull: true },
      cost: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("repair_orders");
  },
};
