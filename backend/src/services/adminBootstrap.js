const bcrypt = require("bcryptjs");

function readRequired(source, name) {
  const value = String(source[name] ?? "").trim();
  if (!value) throw new Error(`La variable ${name} es requerida`);
  return value;
}

function parseInitialAdminConfig(source) {
  const name = readRequired(source, "INITIAL_ADMIN_NAME");
  const email = readRequired(source, "INITIAL_ADMIN_EMAIL").toLowerCase();
  const password = String(source.INITIAL_ADMIN_PASSWORD ?? "");
  const phone = String(source.INITIAL_ADMIN_PHONE ?? "").trim() || null;

  if (name.length < 2 || name.length > 120) {
    throw new Error("INITIAL_ADMIN_NAME debe contener entre 2 y 120 caracteres");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INITIAL_ADMIN_EMAIL debe ser un correo válido");
  }
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error(
      "INITIAL_ADMIN_PASSWORD debe contener al menos 12 caracteres y no superar 72 bytes"
    );
  }
  if (phone && !/^\d{8}$/.test(phone)) {
    throw new Error("INITIAL_ADMIN_PHONE debe contener exactamente 8 números");
  }

  return { name, email, password, phone };
}

async function createInitialAdmin({
  sequelize,
  User,
  config,
  hashPassword = (password) => bcrypt.hash(password, 12),
}) {
  const passwordHash = await hashPassword(config.password);

  return sequelize.transaction(async (transaction) => {
    // Evita que dos ejecuciones simultáneas creen administradores iniciales distintos.
    await sequelize.query('LOCK TABLE "users" IN SHARE ROW EXCLUSIVE MODE', { transaction });

    const adminCount = await User.count({
      where: { role: "admin" },
      transaction,
    });
    if (adminCount > 0) {
      throw new Error("Ya existe un administrador; el comando inicial no puede ejecutarse otra vez");
    }

    const userWithEmail = await User.findOne({
      where: { email: config.email },
      transaction,
    });
    if (userWithEmail) {
      throw new Error("Ya existe un usuario con INITIAL_ADMIN_EMAIL");
    }

    return User.create(
      {
        name: config.name,
        email: config.email,
        phone: config.phone,
        passwordHash,
        role: "admin",
        status: "Disponible",
      },
      { transaction }
    );
  });
}

module.exports = { createInitialAdmin, parseInitialAdminConfig };
