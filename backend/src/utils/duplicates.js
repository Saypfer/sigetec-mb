const { fn, col, where, Op } = require("sequelize");

async function findCaseInsensitiveDuplicate(model, field, value, excludeId = null) {
  if (!value) return null;

  const conditions = [where(fn("lower", col(field)), String(value).trim().toLowerCase())];
  if (excludeId) conditions.push({ id: { [Op.ne]: excludeId } });

  return model.findOne({ where: { [Op.and]: conditions } });
}

module.exports = { findCaseInsensitiveDuplicate };
