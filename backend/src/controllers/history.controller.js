const { HistoryEvent, User, RepairOrder } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const where = req.query.order ? { orderId: req.query.order } : undefined;
  const orderInclude = {
    model: RepairOrder,
    as: "order",
    attributes: ["id", "code"],
    ...(req.user.role === "tecnico"
      ? { where: { technicianId: req.user.id }, required: true }
      : {}),
  };
  const events = await HistoryEvent.findAll({
    where,
    include: [
      { model: User, as: "author", attributes: { exclude: ["passwordHash"] } },
      orderInclude,
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json(events);
});

module.exports = { list };
