const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");
const { findCaseInsensitiveDuplicate } = require("../utils/duplicates");

const attributes = { exclude: ["passwordHash"] };

async function ensureUniqueEmail(email, excludeId = null) {
  const duplicate = await findCaseInsensitiveDuplicate(User, "email", email, excludeId);
  if (duplicate) {
    const error = new Error("Ya existe un usuario con este correo");
    error.status = 409;
    throw error;
  }
}

async function ensureUniquePhone(phone, excludeId = null) {
  if (!phone) return;
  const duplicate = await findCaseInsensitiveDuplicate(User, "phone", phone, excludeId);
  if (duplicate) {
    const error = new Error("Ya existe un usuario con este teléfono");
    error.status = 409;
    throw error;
  }
}

const list = asyncHandler(async (req, res) => {
  const users = await User.findAll({ attributes, order: [["name", "ASC"]] });
  res.json(users);
});

const get = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(user);
});

const create = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, status } = req.body;
  await ensureUniqueEmail(email);
  await ensureUniquePhone(phone);
  if (!password) {
    return res.status(400).json({ message: "La contraseña es requerida" });
  }
  const user = await User.create({
    name,
    email,
    phone: phone || null,
    role,
    status,
    passwordHash: bcrypt.hashSync(password, 10),
  });
  const { passwordHash, ...safeUser } = user.toJSON();
  res.status(201).json(safeUser);
});

const update = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const { name, email, phone, role, status, password } = req.body;
  if (user.role === "admin" && role !== "admin") {
    const adminCount = await User.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Debe existir al menos un administrador" });
    }
  }
  await ensureUniqueEmail(email, user.id);
  await ensureUniquePhone(phone, user.id);
  const updates = { name, email, phone: phone || null, role, status };
  if (password) {
    updates.passwordHash = bcrypt.hashSync(password, 10);
  }
  await user.update(updates);

  const { passwordHash, ...safeUser } = user.toJSON();
  res.json(safeUser);
});

const remove = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  if (user.id === req.user.id) {
    return res.status(400).json({ message: "No puedes eliminar tu propio usuario" });
  }
  if (user.role === "admin") {
    const adminCount = await User.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Debe existir al menos un administrador" });
    }
  }
  await user.destroy();
  res.status(204).send();
});

module.exports = { list, get, create, update, remove };
