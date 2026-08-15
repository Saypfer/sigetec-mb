const { Router } = require("express");
const controller = require("../controllers/clients.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { clientRules } = require("../middleware/validation");

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", clientRules, controller.create);
router.put("/:id", clientRules, controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
