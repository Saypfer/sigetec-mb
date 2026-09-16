const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const { sequelize } = require("./models");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const clientsRoutes = require("./routes/clients.routes");
const devicesRoutes = require("./routes/devices.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const ordersRoutes = require("./routes/orders.routes");
const historyRoutes = require("./routes/history.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportsRoutes = require("./routes/reports.routes");
const { createReadinessHandler, liveness } = require("./controllers/health.controller");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

if (env.trustProxy) app.set("trust proxy", env.trustProxy);

app.use(cors({ origin: env.corsOrigins }));
app.use(express.json());

app.get("/health", liveness);
app.get("/ready", createReadinessHandler(sequelize));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
