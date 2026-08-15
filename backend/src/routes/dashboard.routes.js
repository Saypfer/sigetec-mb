const { Router } = require("express");
const controller = require("../controllers/dashboard.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = Router();

router.get("/", requireAuth, requireRole("admin", "tecnico"), controller.summary);

module.exports = router;
