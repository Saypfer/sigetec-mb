const { logger: defaultLogger } = require("../utils/logger");

function liveness(req, res) {
  return res.json({ status: "ok" });
}

function createReadinessHandler(database, logger = defaultLogger) {
  return async function readiness(req, res) {
    try {
      await database.authenticate();
      return res.json({ status: "ready" });
    } catch (error) {
      logger.error("database_readiness_failed", { requestId: req.requestId }, error);
      return res.status(503).json({ status: "unavailable" });
    }
  };
}

module.exports = { createReadinessHandler, liveness };
