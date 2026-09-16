function createShutdownHandler({ server, database, timeoutMs, logger = console, exit = process.exit }) {
  let shutdownStarted = false;

  return async function shutdown(signal) {
    if (shutdownStarted) return;
    shutdownStarted = true;
    logger.log(`Señal ${signal} recibida. Cerrando el servidor...`);

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      logger.error(`El cierre superó el límite de ${timeoutMs} ms`);
      exit(1);
    }, timeoutMs);
    timeout.unref?.();

    try {
      const serverClosed = new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      server.closeIdleConnections?.();
      await serverClosed;
      await database.close();

      if (!timedOut) {
        clearTimeout(timeout);
        logger.log("Servidor y conexiones de base de datos cerrados correctamente");
        exit(0);
      }
    } catch (error) {
      if (!timedOut) {
        clearTimeout(timeout);
        logger.error("No se pudo cerrar el servidor correctamente:", error);
        exit(1);
      }
    }
  };
}

function registerGracefulShutdown(options) {
  const shutdown = createShutdownHandler(options);
  const handlers = new Map();

  for (const signal of ["SIGTERM", "SIGINT"]) {
    const handler = () => void shutdown(signal);
    handlers.set(signal, handler);
    process.once(signal, handler);
  }

  return () => {
    for (const [signal, handler] of handlers) {
      process.removeListener(signal, handler);
    }
  };
}

module.exports = { createShutdownHandler, registerGracefulShutdown };
