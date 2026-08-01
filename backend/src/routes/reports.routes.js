const { Router } = require("express");
const controller = require("../controllers/reports.controller");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.use(requireAuth);
router.get("/by-month", controller.byMonth);
router.get("/by-status", controller.byStatus);
router.get("/by-technician", controller.byTechnician);
router.get("/most-used-parts", controller.mostUsedParts);
router.get("/low-stock", controller.lowStock);
router.get("/estimated-income", controller.estimatedIncome);

module.exports = router;
