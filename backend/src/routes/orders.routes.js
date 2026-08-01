const { Router } = require("express");
const controller = require("../controllers/orders.controller");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.use(requireAuth);
router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/:id/parts", controller.addPart);
router.post("/:id/observations", controller.addObservation);

module.exports = router;
