const { randomUUID } = require("node:crypto");
const { logger: defaultLogger } = require("../utils/logger");

const quietPaths = new Set(["/health", "/ready"]);

function createRequestContext({
  logger = defaultLogger,
  createId = randomUUID,
  now = Date.now,
} = {}) {
  return function requestContext(req, res, next) {
    const startedAt = now();
    const requestId = createId();
    let logged = false;

    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    function logRequest(outcome) {
      if (logged || quietPaths.has(req.path)) return;
      logged = true;

      const fields = {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Math.max(0, now() - startedAt),
        outcome,
      };
      if (req.user?.id) fields.userId = req.user.id;

      if (outcome === "aborted" || res.statusCode >= 500) {
        logger.error("http_request", fields);
      } else if (res.statusCode >= 400) {
        logger.warn("http_request", fields);
      } else {
        logger.info("http_request", fields);
      }
    }

    res.once("finish", () => logRequest("completed"));
    res.once("close", () => {
      if (!res.writableEnded) logRequest("aborted");
    });
    next();
  };
}

module.exports = { createRequestContext };
