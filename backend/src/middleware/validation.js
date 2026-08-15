const { body, query, validationResult } = require("express-validator");
const { ORDER_STATUSES } = require("../constants/statuses");

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = {};
  for (const error of result.array()) {
    if (!errors[error.path]) errors[error.path] = error.msg;
  }

  return res.status(400).json({
    message: "Revisa los datos ingresados",
    errors,
  });
}

const optionalText = (field, max) =>
  body(field)
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max })
    .withMessage(`No puede superar ${max} caracteres`);

const optionalPhone = (field) =>
  body(field)
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\d{8}$/)
    .withMessage("El teléfono debe contener exactamente 8 números");

const clientRules = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Ingresa un nombre de 2 a 120 caracteres"),
  optionalPhone("phone"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Ingresa un correo válido")
    .normalizeEmail(),
  body("type").isIn(["Individual", "Empresa"]).withMessage("Selecciona un tipo de cliente válido"),
  validateRequest,
];

const inventoryRules = [
  body("code").trim().isLength({ min: 2, max: 40 }).withMessage("Ingresa un código de 2 a 40 caracteres").toUpperCase(),
  body("name").trim().isLength({ min: 2, max: 160 }).withMessage("Ingresa un nombre de 2 a 160 caracteres"),
  optionalText("category", 100),
  body("quantity").isInt({ min: 0 }).withMessage("La cantidad debe ser un entero igual o mayor que cero").toInt(),
  body("minStock").isInt({ min: 0 }).withMessage("El stock mínimo debe ser un entero igual o mayor que cero").toInt(),
  body("price").isFloat({ min: 0 }).withMessage("El precio debe ser igual o mayor que cero").toFloat(),
  optionalText("location", 80),
  validateRequest,
];

const deviceRules = [
  body("type").trim().isLength({ min: 2, max: 80 }).withMessage("Ingresa un tipo de equipo válido"),
  optionalText("brand", 80),
  optionalText("model", 100),
  optionalText("condition", 500),
  body("status").isIn(ORDER_STATUSES).withMessage("Selecciona un estado válido"),
  body("clientId").isInt({ min: 1 }).withMessage("Selecciona un cliente válido").toInt(),
  validateRequest,
];

const userBaseRules = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Ingresa un nombre de 2 a 120 caracteres"),
  body("email").trim().isEmail().withMessage("Ingresa un correo válido").normalizeEmail(),
  optionalPhone("phone"),
  body("role").isIn(["admin", "tecnico"]).withMessage("Selecciona un rol válido"),
  body("status").isIn(["Disponible", "Ocupada"]).withMessage("Selecciona un estado válido"),
];

const createUserRules = [
  ...userBaseRules,
  body("password").isLength({ min: 8, max: 72 }).withMessage("La contraseña debe tener entre 8 y 72 caracteres"),
  validateRequest,
];

const updateUserRules = [
  ...userBaseRules,
  body("password")
    .optional({ values: "falsy" })
    .isLength({ min: 8, max: 72 })
    .withMessage("La contraseña debe tener entre 8 y 72 caracteres"),
  validateRequest,
];

const orderFields = [
  body("code").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Ingresa un código válido").toUpperCase(),
  body("clientId").optional().isInt({ min: 1 }).withMessage("Selecciona un cliente válido").toInt(),
  body("deviceId").optional().isInt({ min: 1 }).withMessage("Selecciona un equipo válido").toInt(),
  optionalText("issue", 2000),
  optionalText("diagnosis", 4000),
  body("technicianId").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("Selecciona un técnico válido").toInt(),
  body("status").optional().isIn(ORDER_STATUSES).withMessage("Selecciona un estado válido"),
  body("entryDate").optional().isISO8601().withMessage("Ingresa una fecha de ingreso válida"),
  body("deliveryDate").optional({ values: "falsy" }).isISO8601().withMessage("Ingresa una fecha de entrega válida"),
  body("cost").optional().isFloat({ min: 0 }).withMessage("El costo debe ser igual o mayor que cero").toFloat(),
  optionalText("notes", 4000),
];

const createOrderRules = [
  body("code").exists().withMessage("El código es requerido"),
  body("clientId").exists().withMessage("El cliente es requerido"),
  body("deviceId").exists().withMessage("El equipo es requerido"),
  body("status").exists().withMessage("El estado es requerido"),
  body("entryDate").exists().withMessage("La fecha de ingreso es requerida"),
  body("partsUsed")
    .optional()
    .isArray({ max: 50 })
    .withMessage("Los repuestos utilizados deben enviarse como una lista de máximo 50 elementos"),
  body("partsUsed.*.inventoryItemId")
    .isInt({ min: 1 })
    .withMessage("Selecciona un repuesto válido")
    .toInt(),
  body("partsUsed.*.quantityUsed")
    .isInt({ min: 1 })
    .withMessage("La cantidad utilizada debe ser un entero mayor que cero")
    .toInt(),
  ...orderFields,
  validateRequest,
];

const updateOrderRules = [...orderFields, validateRequest];

const orderPartRules = [
  body("inventoryItemId").isInt({ min: 1 }).withMessage("Selecciona un repuesto válido").toInt(),
  body("quantityUsed").isInt({ min: 1 }).withMessage("La cantidad debe ser un entero mayor que cero").toInt(),
  validateRequest,
];

const observationRules = [
  body("detail").trim().isLength({ min: 2, max: 4000 }).withMessage("La observación debe tener entre 2 y 4000 caracteres"),
  validateRequest,
];

const reportFilterRules = [
  query("from").optional().isISO8601({ strict: true }).withMessage("La fecha inicial no es válida"),
  query("to")
    .optional()
    .isISO8601({ strict: true })
    .withMessage("La fecha final no es válida")
    .custom((value, { req }) => {
      if (req.query.from && value < req.query.from) {
        throw new Error("La fecha final debe ser igual o posterior a la fecha inicial");
      }
      return true;
    }),
  query("technicianId").optional().isInt({ min: 1 }).withMessage("El técnico seleccionado no es válido").toInt(),
  query("status").optional().isIn(ORDER_STATUSES).withMessage("El estado seleccionado no es válido"),
  validateRequest,
];

module.exports = {
  clientRules,
  inventoryRules,
  deviceRules,
  createUserRules,
  updateUserRules,
  createOrderRules,
  updateOrderRules,
  orderPartRules,
  observationRules,
  reportFilterRules,
};
