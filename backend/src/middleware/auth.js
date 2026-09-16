const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { env } = require("../config/env");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(payload.id, {
      attributes: ["id", "name", "email", "role", "status"],
    });

    if (!user) {
      return res.status(401).json({ message: "La cuenta ya no está disponible" });
    }

    req.user = user.get({ plain: true });
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = { requireAuth };
