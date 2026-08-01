"use strict";

const bcrypt = require("bcryptjs");
const db = require("../models");

const SEED_PASSWORD = "sigetecmb";

module.exports = {
  up: async () => {
    const passwordHash = bcrypt.hashSync(SEED_PASSWORD, 10);

    const admin = await db.User.create({
      name: "Admin MB",
      email: "admin@tallermb.gt",
      passwordHash,
      role: "admin",
      status: "Disponible",
    });
    const carlos = await db.User.create({
      name: "Carlos Méndez",
      email: "carlos@tallermb.gt",
      passwordHash,
      role: "tecnico",
      status: "Disponible",
    });
    const andrea = await db.User.create({
      name: "Andrea Ruiz",
      email: "andrea@tallermb.gt",
      passwordHash,
      role: "tecnico",
      status: "Ocupada",
    });
    const luis = await db.User.create({
      name: "Luis Castro",
      email: "luis@tallermb.gt",
      passwordHash,
      role: "tecnico",
      status: "Disponible",
    });
    await db.User.create({
      name: "Sofía Herrera",
      email: "sofia@tallermb.gt",
      passwordHash,
      role: "tecnico",
      status: "Disponible",
    });

    const maria = await db.Client.create({
      name: "María López",
      phone: "5551-2088",
      email: "maria.lopez@email.com",
      type: "Individual",
    });
    const inversiones = await db.Client.create({
      name: "Inversiones Norte",
      phone: "2220-4510",
      email: "soporte@inortenet.gt",
      type: "Empresa",
    });
    const jose = await db.Client.create({
      name: "José Pérez",
      phone: "5309-8842",
      email: "josep@email.com",
      type: "Individual",
    });
    const claudia = await db.Client.create({
      name: "Claudia Ramos",
      phone: "4015-1177",
      email: "claudia.ramos@email.com",
      type: "Individual",
    });

    const dell = await db.Device.create({
      serial: "DL-35N1-9821",
      type: "Laptop",
      brand: "Dell",
      model: "Inspiron 3511",
      condition: "Recibido con cargador",
      status: "En reparación",
      clientId: maria.id,
    });
    const epson = await db.Device.create({
      serial: "EP-L3250-4402",
      type: "Impresora",
      brand: "Epson",
      model: "L3250",
      condition: "Sin cable USB",
      status: "En diagnóstico",
      clientId: inversiones.id,
    });
    const samsung = await db.Device.create({
      serial: "SM-A32-6193",
      type: "Teléfono",
      brand: "Samsung",
      model: "Galaxy A32",
      condition: "Pantalla con rayones",
      status: "Esperando repuesto",
      clientId: jose.id,
    });
    const macbook = await db.Device.create({
      serial: "MBA-M1-2020",
      type: "Laptop",
      brand: "Apple",
      model: "MacBook Air M1",
      condition: "Equipo completo",
      status: "Finalizado",
      clientId: claudia.id,
    });

    await db.InventoryItem.create({
      code: "REP-001",
      name: "Pantalla LCD 15.6 FHD",
      category: "Pantallas",
      quantity: 7,
      minStock: 4,
      price: 580.0,
      location: "A-01",
    });
    await db.InventoryItem.create({
      code: "REP-014",
      name: "Puerto HDMI tipo A",
      category: "Conectores",
      quantity: 3,
      minStock: 8,
      price: 38.0,
      location: "B-04",
    });
    await db.InventoryItem.create({
      code: "REP-022",
      name: "Batería laptop HP 45Wh",
      category: "Baterías",
      quantity: 11,
      minStock: 5,
      price: 420.0,
      location: "C-02",
    });
    const flexCarga = await db.InventoryItem.create({
      code: "REP-038",
      name: "Flex de carga Samsung A32",
      category: "Móviles",
      quantity: 2,
      minStock: 6,
      price: 75.0,
      location: "B-12",
    });
    await db.InventoryItem.create({
      code: "REP-041",
      name: "Disco SSD 512GB SATA",
      category: "Almacenamiento",
      quantity: 15,
      minStock: 6,
      price: 395.0,
      location: "D-03",
    });

    const order1048 = await db.RepairOrder.create({
      code: "ORD-2026-1048",
      clientId: maria.id,
      deviceId: dell.id,
      issue: "No enciende",
      diagnosis: "Corto en placa principal",
      technicianId: carlos.id,
      status: "En reparación",
      entryDate: "2026-07-08",
      deliveryDate: "2026-07-12",
      cost: 680.0,
      notes: "Cliente autorizó reparación.",
    });
    const order1047 = await db.RepairOrder.create({
      code: "ORD-2026-1047",
      clientId: inversiones.id,
      deviceId: epson.id,
      issue: "No imprime color negro",
      diagnosis: "Cabezal obstruido",
      technicianId: andrea.id,
      status: "En diagnóstico",
      entryDate: "2026-07-08",
      deliveryDate: null,
      cost: 0.0,
      notes: "Pendiente de aprobación.",
    });
    const order1046 = await db.RepairOrder.create({
      code: "ORD-2026-1046",
      clientId: jose.id,
      deviceId: samsung.id,
      issue: "No carga",
      diagnosis: "Puerto dañado",
      technicianId: luis.id,
      status: "Esperando repuesto",
      entryDate: "2026-07-07",
      deliveryDate: null,
      cost: 210.0,
      notes: "Repuesto solicitado.",
    });
    const order1045 = await db.RepairOrder.create({
      code: "ORD-2026-1045",
      clientId: claudia.id,
      deviceId: macbook.id,
      issue: "Teclado falla",
      diagnosis: "Daño por humedad leve",
      technicianId: carlos.id,
      status: "Finalizado",
      entryDate: "2026-07-05",
      deliveryDate: "2026-07-08",
      cost: 450.0,
      notes: "Lista para entrega.",
    });

    await db.OrderPart.create({
      orderId: order1046.id,
      inventoryItemId: flexCarga.id,
      quantityUsed: 1,
    });

    await db.HistoryEvent.create({
      orderId: order1048.id,
      event: "Diagnóstico registrado",
      authorId: carlos.id,
      detail: "Se detectó corto en placa principal.",
      createdAt: new Date("2026-07-08T10:40:00"),
    });
    await db.HistoryEvent.create({
      orderId: order1048.id,
      event: "Repuesto asignado",
      authorId: carlos.id,
      detail: "MOSFET descontado del inventario.",
      createdAt: new Date("2026-07-08T11:15:00"),
    });
    await db.HistoryEvent.create({
      orderId: order1047.id,
      event: "Orden creada",
      authorId: admin.id,
      detail: "Equipo recibido para evaluación.",
      createdAt: new Date("2026-07-08T12:05:00"),
    });
    await db.HistoryEvent.create({
      orderId: order1045.id,
      event: "Orden finalizada",
      authorId: carlos.id,
      detail: "Equipo listo para entrega.",
      createdAt: new Date("2026-07-08T16:25:00"),
    });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("history_events", null, {});
    await queryInterface.bulkDelete("order_parts", null, {});
    await queryInterface.bulkDelete("repair_orders", null, {});
    await queryInterface.bulkDelete("inventory_items", null, {});
    await queryInterface.bulkDelete("devices", null, {});
    await queryInterface.bulkDelete("clients", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
