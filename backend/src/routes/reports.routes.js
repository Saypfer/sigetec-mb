const { Router } = require("express");
const controller = require("../controllers/reports.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { reportFilterRules } = require("../middleware/validation");

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/summary", reportFilterRules, controller.summary);
router.get("/by-month", controller.byMonth);
router.get("/by-status", controller.byStatus);
router.get("/by-technician", controller.byTechnician);
router.get("/most-used-parts", controller.mostUsedParts);
router.get("/low-stock", controller.lowStock);
router.get("/estimated-income", controller.estimatedIncome);

module.exports = router;
