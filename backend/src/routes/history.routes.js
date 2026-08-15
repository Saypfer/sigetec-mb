const { Router } = require("express");
const controller = require("../controllers/history.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = Router();

router.use(requireAuth, requireRole("admin", "tecnico"));
router.get("/", controller.list);

module.exports = router;
