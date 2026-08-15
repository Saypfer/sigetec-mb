const { Router } = require("express");
const controller = require("../controllers/orders.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const {
  createOrderRules,
  updateOrderRules,
  orderPartRules,
  observationRules,
} = require("../middleware/validation");

const router = Router();

router.use(requireAuth, requireRole("admin", "tecnico"));
router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", requireRole("admin"), createOrderRules, controller.create);
router.post("/:id/claim", requireRole("tecnico"), controller.claim);
router.put("/:id", updateOrderRules, controller.update);
router.delete("/:id", requireRole("admin"), controller.remove);
router.post("/:id/parts", orderPartRules, controller.addPart);
router.delete("/:id/parts/:partId", controller.removePart);
router.post("/:id/observations", observationRules, controller.addObservation);

module.exports = router;
