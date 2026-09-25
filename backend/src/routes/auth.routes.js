const { Router } = require("express");
const { rateLimit } = require("express-rate-limit");
const { login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");
const { loginRules } = require("../middleware/validation");

const router = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Demasiados intentos de acceso. Intenta nuevamente en 15 minutos",
  },
});

router.post("/login", loginRateLimit, loginRules, login);
router.get("/me", requireAuth, me);

module.exports = router;
