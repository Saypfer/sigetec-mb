const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const attributes = { exclude: ["passwordHash"] };

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
  const { name, email, password, role, status } = req.body;
  if (!password) {
    return res.status(400).json({ message: "La contraseña es requerida" });
  }
  const user = await User.create({
    name,
    email,
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

  const { name, email, role, status, password } = req.body;
  const updates = { name, email, role, status };
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
  await user.destroy();
  res.status(204).send();
});

module.exports = { list, get, create, update, remove };
