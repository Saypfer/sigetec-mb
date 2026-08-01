const { Router } = require("express");
const controller = require("../controllers/history.controller");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.use(requireAuth);
router.get("/", controller.list);

module.exports = router;
