const { Router } = require("express");
const controller = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { createUserRules, updateUserRules } = require("../middleware/validation");

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", createUserRules, controller.create);
router.put("/:id", updateUserRules, controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
