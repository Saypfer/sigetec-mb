const { newDb } = require("pg-mem");
const { Sequelize, DataTypes } = require("sequelize");

require("moment").suppressDeprecationWarnings = true;

const modelFactories = [
  require("../src/models/user"),
  require("../src/models/client"),
  require("../src/models/device"),
  require("../src/models/inventoryItem"),
  require("../src/models/repairOrder"),
  require("../src/models/orderPart"),
  require("../src/models/historyEvent"),
];

async function createTestDatabase() {
  const memoryDatabase = newDb({
    autoCreateForeignKeyIndices: true,
    noAstCoverageCheck: true,
  });
  const postgresAdapter = memoryDatabase.adapters.createPg();
  const sequelize = new Sequelize("postgres://test:test@localhost:5432/sigetec_test", {
    dialect: "postgres",
    dialectModule: postgresAdapter,
    logging: false,
  });
  const testDataTypes = new Proxy(DataTypes, {
    get(target, property, receiver) {
      // pg-mem no implementa la consulta de catálogos que Sequelize usa al sincronizar ENUM.
      // Las reglas HTTP siguen validando los mismos valores; para esta base efímera basta STRING.
      if (property === "ENUM") return () => DataTypes.STRING;
      return Reflect.get(target, property, receiver);
    },
  });

  const db = {};
  for (const createModel of modelFactories) {
    const model = createModel(sequelize, testDataTypes);
    db[model.name] = model;
  }

  for (const model of Object.values(db)) {
    if (model.associate) model.associate(db);
  }

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  await sequelize.sync({ force: true });

  const runTransaction = sequelize.transaction.bind(sequelize);
  sequelize.transaction = async (...args) => {
    const snapshot = memoryDatabase.backup();
    try {
      return await runTransaction(...args);
    } catch (error) {
      // pg-mem no revierte transacciones; el snapshot conserva la semántica esperada
      // para comprobar que los controladores no dejan cambios parciales al fallar.
      snapshot.restore();
      throw error;
    }
  };

  return db;
}

module.exports = { createTestDatabase };
