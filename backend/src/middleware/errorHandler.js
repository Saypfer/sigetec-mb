const { ValidationError, UniqueConstraintError } = require("sequelize");

function notFoundHandler(req, res) {
  res.status(404).json({ message: "Recurso no encontrado" });
}

function errorHandler(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ message: "Ya existe un registro con ese valor único" });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
  }

  console.error(err);
  return res.status(err.status || 500).json({ message: err.message || "Error interno del servidor" });
}

module.exports = { notFoundHandler, errorHandler };
