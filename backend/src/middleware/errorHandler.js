const { ForeignKeyConstraintError, ValidationError, UniqueConstraintError } = require("sequelize");

function notFoundHandler(req, res) {
  res.status(404).json({ message: "Recurso no encontrado" });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof UniqueConstraintError) {
    const field = Object.keys(err.fields ?? {})[0];
    const labels = {
      code: "código",
      email: "correo",
      serial: "serie",
    };
    return res.status(409).json({
      message: `Ya existe un registro con este ${labels[field] ?? "valor"}`,
    });
  }
  if (err instanceof ValidationError) {
    const errors = {};
    for (const validationError of err.errors) {
      errors[validationError.path] = validationError.message;
    }
    return res.status(400).json({ message: "Revisa los datos ingresados", errors });
  }
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      message: "No se puede eliminar el registro porque está relacionado con otros datos",
    });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "El cuerpo de la solicitud contiene JSON inválido" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ message: "El cuerpo de la solicitud supera el límite permitido" });
  }

  const status = Number(err?.status);
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({ message: err.message || "No se pudo completar la solicitud" });
  }

  console.error(err);
  return res.status(500).json({ message: "Error interno del servidor" });
}

module.exports = { notFoundHandler, errorHandler };
