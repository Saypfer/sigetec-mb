"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "phone", {
      type: Sequelize.STRING(8),
      allowNull: true,
    });
    await queryInterface.changeColumn("devices", "serial", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("devices", "brand", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("devices", "model", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    const [devices] = await queryInterface.sequelize.query(
      'SELECT id FROM "devices" WHERE "serial" IS NULL ORDER BY id'
    );
    for (const device of devices) {
      await queryInterface.sequelize.query(
        'UPDATE "devices" SET "serial" = :serial WHERE id = :id',
        { replacements: { id: device.id, serial: `SIN-SERIE-${device.id}` } }
      );
    }
    await queryInterface.sequelize.query('UPDATE "devices" SET "brand" = \'\' WHERE "brand" IS NULL');
    await queryInterface.sequelize.query('UPDATE "devices" SET "model" = \'\' WHERE "model" IS NULL');
    await queryInterface.changeColumn("devices", "serial", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("devices", "brand", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("devices", "model", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn("users", "phone");
  },
};
