const { Client } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

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
  const client = await Client.create(req.body);
  res.status(201).json(client);
});

const update = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
  await client.update(req.body);
  res.json(client);
});

const remove = asyncHandler(async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
  await client.destroy();
  res.status(204).send();
});

module.exports = { list, get, create, update, remove };
