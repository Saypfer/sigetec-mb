function liveness(req, res) {
  return res.json({ status: "ok" });
}

function createReadinessHandler(database, logger = console) {
  return async function readiness(req, res) {
    try {
      await database.authenticate();
      return res.json({ status: "ready" });
    } catch (error) {
      logger.error("La comprobación de disponibilidad de PostgreSQL falló:", error);
      return res.status(503).json({ status: "unavailable" });
    }
  };
}

module.exports = { createReadinessHandler, liveness };
