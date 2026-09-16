const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const { env } = require("../config/env");

const basename = path.basename(__filename);
const config = require("../config/config.js")[env.nodeEnv];

const sequelize = new Sequelize(
  env.databaseUrl,
  config
);

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
