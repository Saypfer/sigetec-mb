const SERVICE_NAME = "sigetec-mb-backend";

function redact(value) {
  return String(value ?? "")
    .replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/gi, "$1[REDACTED]@")
    .replace(/(Bearer\s+)[^\s]+/gi, "$1[REDACTED]");
}

function serializeError(error) {
  if (!error) return undefined;
  return {
    name: error.name || "Error",
    message: redact(error.message || "Error desconocido"),
    ...(error.stack ? { stack: redact(error.stack) } : {}),
  };
}

function createLogger({
  write = (line) => console.log(line),
  errorWrite = (line) => console.error(line),
  now = () => new Date().toISOString(),
} = {}) {
  function emit(level, event, fields = {}, error) {
    const record = {
      ...fields,
      timestamp: now(),
      level,
      service: SERVICE_NAME,
      event,
    };
    const serializedError = serializeError(error);
    if (serializedError) record.error = serializedError;

    const line = JSON.stringify(record);
    if (level === "error") errorWrite(line);
    else write(line);
  }

  return {
    info: (event, fields) => emit("info", event, fields),
    warn: (event, fields) => emit("warn", event, fields),
    error: (event, fields, error) => emit("error", event, fields, error),
  };
}

const logger = process.env.NODE_ENV === "test"
  ? createLogger({ write: () => {}, errorWrite: () => {} })
  : createLogger();

module.exports = { createLogger, logger, redact, serializeError };
