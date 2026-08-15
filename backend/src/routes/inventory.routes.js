const { Router } = require("express");
const controller = require("../controllers/inventory.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { inventoryRules } = require("../middleware/validation");

const router = Router();

router.use(requireAuth, requireRole("admin", "tecnico"));
router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", requireRole("admin"), inventoryRules, controller.create);
router.put("/:id", requireRole("admin"), inventoryRules, controller.update);
router.delete("/:id", requireRole("admin"), controller.remove);

module.exports = router;
