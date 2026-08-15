const { Client } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");
const { findCaseInsensitiveDuplicate } = require("../utils/duplicates");

async function ensureUniqueEmail(email, excludeId = null) {
  const duplicate = await findCaseInsensitiveDuplicate(Client, "email", email, excludeId);
  if (duplicate) {
    const error = new Error("Ya existe un cliente con este correo");
    error.status = 409;
    throw error;
  }
}

async function ensureUniquePhone(phone, excludeId = null) {
  const duplicate = await findCaseInsensitiveDuplicate(Client, "phone", phone, excludeId);
  if (duplicate) {
    const error = new Error("Ya existe un cliente con este teléfono");
    error.status = 409;
    throw error;
  }
}

const list = asyncHandler(async (req, res) => {
  const clients = await Client.findAll({ order: [["name", "ASC"]] });
  res.json(clients);
});

const get = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
  res.json(client);
});

const create = asyncHandler(async (req, res) => {
  await ensureUniqueEmail(req.body.email);
  await ensureUniquePhone(req.body.phone);
  const client = await Client.create({
    ...req.body,
    email: req.body.email || null,
    phone: req.body.phone || null,
  });
  res.status(201).json(client);
});

const update = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
  await ensureUniqueEmail(req.body.email, client.id);
  await ensureUniquePhone(req.body.phone, client.id);
  await client.update({
    ...req.body,
    email: req.body.email || null,
    phone: req.body.phone || null,
  });
  res.json(client);
});

const remove = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
  await client.destroy();
  res.status(204).send();
});

module.exports = { list, get, create, update, remove };
