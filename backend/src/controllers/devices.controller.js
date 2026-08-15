const { Device, Client } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

function getDeviceData(body) {
  return {
    type: body.type,
    brand: body.brand || null,
    model: body.model || null,
    condition: body.condition || null,
    status: body.status,
    clientId: body.clientId,
  };
}

const include = [{ model: Client, as: "owner" }];

const list = asyncHandler(async (req, res) => {
  const devices = await Device.findAll({ include, order: [["createdAt", "DESC"]] });
  res.json(devices);
});

const get = asyncHandler(async (req, res) => {
  const device = await Device.findByPk(req.params.id, { include });
  if (!device) return res.status(404).json({ message: "Equipo no encontrado" });
  res.json(device);
});

const create = asyncHandler(async (req, res) => {
  const device = await Device.create(getDeviceData(req.body));
  res.status(201).json(device);
});

const update = asyncHandler(async (req, res) => {
  const device = await Device.findByPk(req.params.id);
  if (!device) return res.status(404).json({ message: "Equipo no encontrado" });
  await device.update(getDeviceData(req.body));
  res.json(device);
});

const remove = asyncHandler(async (req, res) => {
  const device = await Device.findByPk(req.params.id);
  if (!device) return res.status(404).json({ message: "Equipo no encontrado" });
  await device.destroy();
  res.status(204).send();
});

module.exports = { list, get, create, update, remove };
