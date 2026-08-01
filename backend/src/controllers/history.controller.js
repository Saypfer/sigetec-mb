const { HistoryEvent, User, RepairOrder } = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const where = req.query.order ? { orderId: req.query.order } : undefined;
  const events = await HistoryEvent.findAll({
    where,
    include: [
      { model: User, as: "author", attributes: { exclude: ["passwordHash"] } },
      { model: RepairOrder, as: "order", attributes: ["id", "code"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json(events);
});

module.exports = { list };
