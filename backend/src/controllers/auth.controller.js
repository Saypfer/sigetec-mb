const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { env } = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");

const DUMMY_PASSWORD_HASH = "$2a$10$zAh9cpPgdjqwedRL3rzheOnHHwOj5c4wY5oDo2Q/JQkZvhDfg5dCG";

function sanitizeUser(user) {
  const { id, name, email, role, status, lastAccess } = user;
  return { id, name, email, role, status, lastAccess };
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos" });
  }

  const user = await User.findOne({ where: { email } });
  const validPassword = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !validPassword) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  user.lastAccess = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return res.json({ token, user: sanitizeUser(user) });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  return res.json(sanitizeUser(user));
});

module.exports = { login, me };
