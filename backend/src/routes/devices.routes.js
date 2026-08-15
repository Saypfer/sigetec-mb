const { Router } = require("express");
const controller = require("../controllers/devices.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { deviceRules } = require("../middleware/validation");

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", deviceRules, controller.create);
router.put("/:id", deviceRules, controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
