import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Cpu,
  FileClock,
  FileText,
  Gauge,
  History,
  Eye,
  Laptop,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  createClient,
  createDevice,
  createInventoryItem,
  createOrder,
  createUser,
  deleteClient,
  deleteDevice,
  deleteInventoryItem,
  deleteOrder,
  deleteUser,
  getClients,
  getDashboard,
  getDevices,
  getHistory,
  getInventory,
  getOrders,
  getReports,
  getUsers,
  loginUser,
  updateClient,
  updateDevice,
  updateInventoryItem,
  updateOrder,
  updateUser,
} from "./api";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventario", icon: Boxes },
  { id: "orders", label: "Órdenes", icon: ClipboardList },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "devices", label: "Equipos", icon: Laptop },
  { id: "technicians", label: "Técnicos", icon: Wrench },
  { id: "history", label: "Historial", icon: History },
  { id: "reports", label: "Reportes", icon: BarChart3 },
  { id: "users", label: "Usuarios", icon: ShieldCheck },
  { id: "settings", label: "Configuración", icon: Settings },
];

const stats = [
  {
    label: "Órdenes registradas",
    value: "248",
    change: "+12 este mes",
    icon: FileText,
    tone: "blue",
  },
  {
    label: "Pendientes",
    value: "32",
    change: "8 urgentes",
    icon: CalendarClock,
    tone: "amber",
  },
  {
    label: "En reparación",
    value: "47",
    change: "14 técnicos activos",
    icon: Wrench,
    tone: "teal",
  },
  {
    label: "Finalizadas",
    value: "169",
    change: "96% entregadas",
    icon: CheckCircle2,
    tone: "emerald",
  },
];

const inventory = [
  {
    code: "REP-001",
    name: "Pantalla LCD 15.6 FHD",
    category: "Pantallas",
    quantity: 7,
    min: 4,
    price: "Q 580.00",
    location: "A-01",
    status: "Disponible",
  },
  {
    code: "REP-014",
    name: "Puerto HDMI tipo A",
    category: "Conectores",
    quantity: 3,
    min: 8,
    price: "Q 38.00",
    location: "B-04",
    status: "Stock bajo",
  },
  {
    code: "REP-022",
    name: "Batería laptop HP 45Wh",
    category: "Baterías",
    quantity: 11,
    min: 5,
    price: "Q 420.00",
    location: "C-02",
    status: "Disponible",
  },
  {
    code: "REP-038",
    name: "Flex de carga Samsung A32",
    category: "Móviles",
    quantity: 2,
    min: 6,
    price: "Q 75.00",
    location: "B-12",
    status: "Stock bajo",
  },
  {
    code: "REP-041",
    name: "Disco SSD 512GB SATA",
    category: "Almacenamiento",
    quantity: 15,
    min: 6,
    price: "Q 395.00",
    location: "D-03",
    status: "Disponible",
  },
];

const orders = [
  {
    code: "ORD-2026-1048",
    client: "María López",
    device: "Laptop Dell Inspiron 3511",
    issue: "No enciende",
    diagnosis: "Corto en placa principal",
    technician: "Carlos Méndez",
    parts: "MOSFET, pasta térmica",
    status: "En reparación",
    entry: "08/07/2026",
    delivery: "12/07/2026",
    cost: "Q 680.00",
    notes: "Cliente autorizó reparación.",
  },
  {
    code: "ORD-2026-1047",
    client: "Inversiones Norte",
    device: "Impresora Epson L3250",
    issue: "No imprime color negro",
    diagnosis: "Cabezal obstruido",
    technician: "Andrea Ruiz",
    parts: "Kit limpieza",
    status: "En diagnóstico",
    entry: "08/07/2026",
    delivery: "Pendiente",
    cost: "Q 0.00",
    notes: "Pendiente de aprobación.",
  },
  {
    code: "ORD-2026-1046",
    client: "José Pérez",
    device: "Samsung Galaxy A32",
    issue: "No carga",
    diagnosis: "Puerto dañado",
    technician: "Luis Castro",
    parts: "Flex de carga",
    status: "Esperando repuesto",
    entry: "07/07/2026",
    delivery: "Pendiente",
    cost: "Q 210.00",
    notes: "Repuesto solicitado.",
  },
  {
    code: "ORD-2026-1045",
    client: "Claudia Ramos",
    device: "MacBook Air M1",
    issue: "Teclado falla",
    diagnosis: "Daño por humedad leve",
    technician: "Carlos Méndez",
    parts: "Limpieza ultrasónica",
    status: "Finalizado",
    entry: "05/07/2026",
    delivery: "08/07/2026",
    cost: "Q 450.00",
    notes: "Lista para entrega.",
  },
];

const clients = [
  {
    name: "María López",
    phone: "5551-2088",
    email: "maria.lopez@email.com",
    orders: 4,
    lastVisit: "08/07/2026",
    type: "Individual",
  },
  {
    name: "Inversiones Norte",
    phone: "2220-4510",
    email: "soporte@inortenet.gt",
    orders: 18,
    lastVisit: "08/07/2026",
    type: "Empresa",
  },
  {
    name: "José Pérez",
    phone: "5309-8842",
    email: "josep@email.com",
    orders: 2,
    lastVisit: "07/07/2026",
    type: "Individual",
  },
  {
    name: "Claudia Ramos",
    phone: "4015-1177",
    email: "claudia.ramos@email.com",
    orders: 5,
    lastVisit: "05/07/2026",
    type: "Individual",
  },
];

const devices = [
  {
    serial: "DL-35N1-9821",
    type: "Laptop",
    brand: "Dell",
    model: "Inspiron 3511",
    owner: "María López",
    condition: "Recibido con cargador",
    status: "En reparación",
  },
  {
    serial: "EP-L3250-4402",
    type: "Impresora",
    brand: "Epson",
    model: "L3250",
    owner: "Inversiones Norte",
    condition: "Sin cable USB",
    status: "En diagnóstico",
  },
  {
    serial: "SM-A32-6193",
    type: "Teléfono",
    brand: "Samsung",
    model: "Galaxy A32",
    owner: "José Pérez",
    condition: "Pantalla con rayones",
    status: "Esperando repuesto",
  },
  {
    serial: "MBA-M1-2020",
    type: "Laptop",
    brand: "Apple",
    model: "MacBook Air M1",
    owner: "Claudia Ramos",
    condition: "Equipo completo",
    status: "Finalizado",
  },
];

const technicians = [
  {
    name: "Carlos Méndez",
    specialty: "Laptops y placas",
    activeOrders: 9,
    completed: 76,
    performance: "96%",
    availability: "Disponible",
  },
  {
    name: "Andrea Ruiz",
    specialty: "Impresoras y periféricos",
    activeOrders: 6,
    completed: 58,
    performance: "93%",
    availability: "Ocupada",
  },
  {
    name: "Luis Castro",
    specialty: "Móviles",
    activeOrders: 8,
    completed: 64,
    performance: "91%",
    availability: "Disponible",
  },
  {
    name: "Sofía Herrera",
    specialty: "Consolas y audio",
    activeOrders: 4,
    completed: 39,
    performance: "89%",
    availability: "Disponible",
  },
];

const history = [
  {
    order: "ORD-2026-1048",
    date: "08/07/2026 10:40",
    event: "Diagnóstico registrado",
    author: "Carlos Méndez",
    detail: "Se detectó corto en placa principal.",
  },
  {
    order: "ORD-2026-1048",
    date: "08/07/2026 11:15",
    event: "Repuesto asignado",
    author: "Carlos Méndez",
    detail: "MOSFET descontado del inventario.",
  },
  {
    order: "ORD-2026-1047",
    date: "08/07/2026 12:05",
    event: "Orden creada",
    author: "Admin MB",
    detail: "Equipo recibido para evaluación.",
  },
  {
    order: "ORD-2026-1045",
    date: "08/07/2026 16:25",
    event: "Orden finalizada",
    author: "Carlos Méndez",
    detail: "Equipo listo para entrega.",
  },
];

const reports = [
  { label: "Reparaciones por mes", value: 86, max: 100, color: "bg-brand-500" },
  { label: "Repuestos más utilizados", value: 64, max: 100, color: "bg-teal-500" },
  { label: "Órdenes por estado", value: 47, max: 100, color: "bg-amber-500" },
  { label: "Reparaciones por técnico", value: 78, max: 100, color: "bg-emerald-500" },
  { label: "Bajo stock", value: 18, max: 100, color: "bg-rose-500" },
  { label: "Ingresos estimados", value: 72, max: 100, color: "bg-indigo-500" },
];

const statusStyles = {
  Disponible: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Stock bajo": "bg-rose-50 text-rose-700 ring-rose-200",
  Pendiente: "bg-amber-50 text-amber-700 ring-amber-200",
  "En diagnóstico": "bg-sky-50 text-sky-700 ring-sky-200",
  "En reparación": "bg-teal-50 text-teal-700 ring-teal-200",
  "Esperando repuesto": "bg-orange-50 text-orange-700 ring-orange-200",
  Finalizado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Entregado: "bg-slate-100 text-slate-700 ring-slate-200",
  Cancelado: "bg-rose-50 text-rose-700 ring-rose-200",
  Ocupada: "bg-amber-50 text-amber-700 ring-amber-200",
};

const orderStatusOptions = [
  "Pendiente",
  "En diagnóstico",
  "En reparación",
  "Esperando repuesto",
  "Finalizado",
  "Entregado",
  "Cancelado",
];

const moduleTitles = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Vista general de órdenes, inventario y operación técnica.",
  },
  inventory: {
    title: "Inventario de repuestos",
    subtitle: "Control visual de existencias, costos, ubicación y alertas.",
  },
  orders: {
    title: "Órdenes de reparación",
    subtitle: "Seguimiento de diagnóstico, repuestos, estado y costos.",
  },
  clients: {
    title: "Clientes",
    subtitle: "Registro de clientes individuales y empresariales.",
  },
  devices: {
    title: "Equipos electrónicos",
    subtitle: "Equipos recibidos, propietario, condición y estado actual.",
  },
  technicians: {
    title: "Técnicos",
    subtitle: "Carga de trabajo, especialidad y rendimiento del equipo.",
  },
  history: {
    title: "Historial de mantenimiento",
    subtitle: "Trazabilidad de eventos técnicos y administrativos.",
  },
  reports: {
    title: "Reportes",
    subtitle: "Indicadores operativos y financieros con datos de prueba.",
  },
  users: {
    title: "Usuarios y roles",
    subtitle: "Vista preliminar para administración de accesos.",
  },
  settings: {
    title: "Configuración",
    subtitle: "Parámetros generales del taller y del sistema.",
  },
};

const SESSION_STORAGE_KEY = "sigetec_mb_session";

function getStoredSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

function getRoleLabel(role) {
  return role === "admin" ? "Administrador" : "Técnico";
}

function App() {
  const [session, setSession] = useState(getStoredSession);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentModule = moduleTitles[activeModule] ?? moduleTitles.dashboard;
  const isAuthenticated = Boolean(session?.token);

  async function handleLogin(credentials) {
    const nextSession = await loginUser(credentials);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setActiveModule("dashboard");
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-ink">
      <Sidebar
        activeModule={activeModule}
        onSelect={(id) => {
          setActiveModule(id);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={session.user}
      />
      <div className="lg:pl-72">
        <Topbar
          title={currentModule.title}
          subtitle={currentModule.subtitle}
          onMenu={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ModuleRenderer activeModule={activeModule} token={session.token} />
        </main>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("admin@tallermb.gt");
  const [password, setPassword] = useState("sigetecmb");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onLogin({ email, password });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef3f8]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-ink lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,121,209,0.45),transparent_32%),radial-gradient(circle_at_75%_45%,rgba(20,184,166,0.22),transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <div>
              <div className="inline-flex items-center gap-3 rounded border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                <Cpu className="h-5 w-5 text-cyan-200" />
                <span className="text-sm font-semibold">SIGETEC-MB</span>
              </div>
              <h1 className="mt-16 max-w-2xl text-5xl font-semibold leading-tight tracking-normal">
                Gestión técnica para repuestos, reparaciones y trazabilidad.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
                Panel interno para Taller de Electrónicos MB con seguimiento de
                órdenes, inventario y mantenimiento técnico.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {["248 órdenes", "14 técnicos", "18 alertas"].map((item) => (
                <div key={item} className="rounded border border-white/15 bg-white/10 p-4">
                  <p className="text-sm font-medium text-slate-200">{item}</p>
                  <div className="mt-3 h-1.5 rounded bg-white/20">
                    <div className="h-full w-2/3 rounded bg-cyan-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded bg-brand-600 text-white">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-700">SIGETEC-MB</p>
                <h2 className="text-2xl font-semibold tracking-normal text-ink">
                  Iniciar sesión
                </h2>
              </div>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
            >
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Correo</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Contraseña</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              {error ? (
                <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-600" />
                  Recordar sesión
                </label>
                <button type="button" className="font-medium text-brand-700">
                  Recuperar acceso
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Validando acceso..." : "Entrar al sistema"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar({ activeModule, onSelect, open, onClose, user }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-line bg-white transition lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-line px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-brand-600 text-white">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-700">SIGETEC-MB</p>
              <p className="text-xs text-slate-500">Taller Electrónicos MB</p>
            </div>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded border border-line text-slate-600 lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
                  selected
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-line p-4">
          <div className="rounded border border-line bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded bg-teal-600 text-white">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name ?? "Usuario"}</p>
                <p className="truncate text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, onMenu, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded border border-line text-slate-700 lg:hidden"
            onClick={onMenu}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-normal text-ink sm:text-2xl">
              {title}
            </h1>
            <p className="hidden truncate text-sm text-slate-500 sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded border border-line bg-slate-50 px-3 py-2 md:flex">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              className="w-56 bg-transparent text-sm outline-none"
              placeholder="Buscar orden, cliente o repuesto"
            />
          </div>
          <IconButton label="Notificaciones">
            <Bell className="h-4 w-4" />
          </IconButton>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 items-center gap-2 rounded border border-line px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function IconButton({ label, children }) {
  return (
    <button
      type="button"
      className="grid h-10 w-10 place-items-center rounded border border-line text-slate-700 transition hover:bg-slate-50"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function ModuleRenderer({ activeModule, token }) {
  const modules = {
    dashboard: <DashboardLive token={token} />,
    inventory: <InventoryLive token={token} />,
    orders: <OrdersLive token={token} />,
    clients: <ClientsLive token={token} />,
    devices: <DevicesLive token={token} />,
    technicians: <TechniciansLive token={token} />,
    history: <MaintenanceHistoryLive token={token} />,
    reports: <ReportsLive token={token} />,
    users: <UsersLive token={token} />,
    settings: <SettingsModule />,
  };

  return modules[activeModule] ?? <DashboardLive token={token} />;
}

function DashboardLive({ token }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getDashboard(token);
        if (!ignore) {
          setDashboardData(data);
        }
      } catch (nextError) {
        if (!ignore) {
          setError(nextError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (token) {
      loadDashboard();
    }

    return () => {
      ignore = true;
    };
  }, [token]);

  const dashboardStats = dashboardData
    ? [
        {
          label: "Ordenes registradas",
          value: dashboardData.totalOrders,
          change: "Datos desde Neon",
          icon: FileText,
          tone: "blue",
        },
        {
          label: "Pendientes",
          value: dashboardData.pendingOrders,
          change: "Ordenes por iniciar",
          icon: CalendarClock,
          tone: "amber",
        },
        {
          label: "En reparacion",
          value: dashboardData.inRepairOrders,
          change: "Trabajo activo",
          icon: Wrench,
          tone: "teal",
        },
        {
          label: "Finalizadas",
          value: dashboardData.finishedOrders,
          change: "Finalizadas o entregadas",
          icon: CheckCircle2,
          tone: "emerald",
        },
      ]
    : stats;

  const recentOrders = dashboardData
    ? (dashboardData.recentOrders ?? []).map((order) => ({
        code: order.code,
        client: order.client?.name ?? "Sin cliente",
        device: [order.device?.brand, order.device?.model].filter(Boolean).join(" ") || "Sin equipo",
        technician: order.technician?.name ?? "Sin asignar",
        status: order.status,
        cost: `Q ${Number(order.cost ?? 0).toLocaleString("es-GT", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      }))
    : orders;

  const lowStockItems = dashboardData
    ? (dashboardData.lowStockItems ?? []).map((item) => ({ ...item, min: item.minStock }))
    : inventory.filter((item) => item.status === "Stock bajo");

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
          Cargando datos del dashboard...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <Panel
          title="Ultimas ordenes registradas"
          action={
            <button className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" />
              Filtrar
            </button>
          }
        >
          <ResponsiveTable
            columns={["Orden", "Cliente", "Equipo", "Tecnico", "Estado", "Costo"]}
            rows={recentOrders.map((order) => [
              order.code,
              order.client,
              order.device,
              order.technician,
              <Badge key={order.code} label={order.status} />,
              order.cost,
            ])}
          />
        </Panel>

        <Panel title="Alertas de inventario">
          <div className="space-y-3">
            {lowStockItems.length ? (
              lowStockItems.map((item) => (
                <div key={item.code} className="rounded border border-line bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-rose-50 text-rose-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-ink">{item.name}</p>
                        <Badge label="Stock bajo" />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        Existencia {item.quantity} / minimo {item.min}. Ubicacion {item.location}.
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded border border-line bg-slate-50 p-4 text-sm text-slate-600">
                No hay repuestos con stock bajo.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <MiniPanel
          icon={PackageCheck}
          label="Repuestos con stock bajo"
          value={dashboardData?.lowStockCount ?? "18"}
          tone="rose"
        />
        <MiniPanel icon={Gauge} label="Productividad semanal" value="91%" tone="teal" />
        <MiniPanel icon={FileClock} label="Tiempo promedio" value="2.4 dias" tone="blue" />
      </div>
    </div>
  );
}

function useApiData(loader, token) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useMemo(
    () => async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await loader(token);
        setData(response);
      } catch (nextError) {
        setError(nextError.message);
      } finally {
        setIsLoading(false);
      }
    },
    [loader, token]
  );

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      setIsLoading(true);
      setError("");

      try {
        const response = await loader(token);
        if (!ignore) {
          setData(response);
        }
      } catch (nextError) {
        if (!ignore) {
          setError(nextError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (token) {
      loadInitialData();
    }

    return () => {
      ignore = true;
    };
  }, [loader, token]);

  return { data, isLoading, error, reload: loadData };
}

function formatMoney(value) {
  return `Q ${Number(value ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "Pendiente";
  return new Date(value).toLocaleDateString("es-GT");
}

function ModuleState({ isLoading, error }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
        Cargando datos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  return null;
}

function EmptyState({ title = "Sin registros", description = "Cuando existan datos, apareceran aqui." }) {
  return (
    <div className="rounded border border-dashed border-line bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Modal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded border border-line text-slate-600 hover:bg-slate-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
    />
  );
}

function SelectInput({ children, ...props }) {
  return (
    <select
      {...props}
      className="mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
    >
      {children}
    </select>
  );
}

function TextAreaInput(props) {
  return (
    <textarea
      {...props}
      className="mt-2 min-h-24 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
    />
  );
}

function FormActions({ isSubmitting, onCancel }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex justify-center rounded border border-line px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex justify-center rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}

function FormError({ message }) {
  if (!message) return null;

  return (
    <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
      {message}
    </div>
  );
}

function LiveTable({ columns, rows, emptyTitle, emptyDescription }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <ResponsiveTable columns={columns} rows={rows} />;
}

function CrudActions({ onView, onEdit, onDelete }) {
  return (
    <div className="flex min-w-28 items-center justify-end gap-1">
      <ActionIconButton label="Ver detalle" onClick={onView}>
        <Eye className="h-4 w-4" />
      </ActionIconButton>
      <ActionIconButton label="Editar" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </ActionIconButton>
      <ActionIconButton label="Eliminar" onClick={onDelete} danger>
        <Trash2 className="h-4 w-4" />
      </ActionIconButton>
    </div>
  );
}

function ActionIconButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded border transition ${
        danger
          ? "border-rose-200 text-rose-600 hover:bg-rose-50"
          : "border-line text-slate-600 hover:bg-slate-50 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

function useCrudActions(token, removeItem, reload) {
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function confirmDelete() {
    if (!deleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await removeItem(token, deleting.id);
      await reload();
      setDeleting(null);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function requestDelete(item) {
    setDeleteError("");
    setDeleting(item);
  }

  return {
    viewing,
    setViewing,
    editing,
    setEditing,
    deleting,
    requestDelete,
    closeDelete: () => {
      if (!isDeleting) setDeleting(null);
    },
    confirmDelete,
    isDeleting,
    deleteError,
  };
}

function DeleteConfirmation({ open, name, isDeleting, error, onClose, onConfirm }) {
  return (
    <Modal title="Confirmar eliminacion" open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-slate-800">Esta accion no se puede deshacer.</p>
          <p className="mt-1 text-sm text-slate-600">
            Se eliminara <span className="font-semibold">{name}</span> de forma permanente.
          </p>
        </div>
        <FormError message={error} />
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded border border-line px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:bg-slate-400"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetailGrid({ items }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(({ label, value, wide = false }) => (
        <div key={label} className={wide ? "sm:col-span-2" : ""}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">{value ?? "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

function CreateClientForm({ token, initialData = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    type: initialData?.type ?? "Individual",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (initialData) {
        await updateClient(token, initialData.id, form);
      } else {
        await createClient(token, form);
      }
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormError message={error} />
      <Field label="Nombre">
        <TextInput value={form.name} onChange={(event) => update("name", event.target.value)} required />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Telefono">
          <TextInput value={form.phone} onChange={(event) => update("phone", event.target.value)} />
        </Field>
        <Field label="Correo">
          <TextInput type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
        </Field>
      </div>
      <Field label="Tipo">
        <SelectInput value={form.type} onChange={(event) => update("type", event.target.value)}>
          <option value="Individual">Individual</option>
          <option value="Empresa">Empresa</option>
        </SelectInput>
      </Field>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
}

function CreateInventoryForm({ token, initialData = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    category: initialData?.category ?? "",
    quantity: initialData?.quantity ?? 0,
    minStock: initialData?.minStock ?? 0,
    price: initialData?.price ?? 0,
    location: initialData?.location ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        minStock: Number(form.minStock),
        price: Number(form.price),
      };
      if (initialData) {
        await updateInventoryItem(token, initialData.id, payload);
      } else {
        await createInventoryItem(token, payload);
      }
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormError message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Codigo">
          <TextInput value={form.code} onChange={(event) => update("code", event.target.value)} required />
        </Field>
        <Field label="Nombre del repuesto">
          <TextInput value={form.name} onChange={(event) => update("name", event.target.value)} required />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Categoria">
          <TextInput value={form.category} onChange={(event) => update("category", event.target.value)} />
        </Field>
        <Field label="Ubicacion">
          <TextInput value={form.location} onChange={(event) => update("location", event.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Cantidad">
          <TextInput type="number" min="0" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} />
        </Field>
        <Field label="Stock minimo">
          <TextInput type="number" min="0" value={form.minStock} onChange={(event) => update("minStock", event.target.value)} />
        </Field>
        <Field label="Precio">
          <TextInput type="number" min="0" step="0.01" value={form.price} onChange={(event) => update("price", event.target.value)} />
        </Field>
      </div>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
}

function CreateDeviceForm({ token, clients, initialData = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    serial: initialData?.serial ?? "",
    type: initialData?.type ?? "",
    brand: initialData?.brand ?? "",
    model: initialData?.model ?? "",
    condition: initialData?.condition ?? "",
    status: initialData?.status ?? "Pendiente",
    clientId: initialData?.clientId ?? clients[0]?.id ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = { ...form, clientId: Number(form.clientId) };
      if (initialData) {
        await updateDevice(token, initialData.id, payload);
      } else {
        await createDevice(token, payload);
      }
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!clients.length) {
    return <EmptyState title="Primero registra un cliente" description="Un equipo necesita un propietario." />;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormError message={error} />
      <Field label="Cliente propietario">
        <SelectInput value={form.clientId} onChange={(event) => update("clientId", event.target.value)} required>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Serie">
          <TextInput value={form.serial} onChange={(event) => update("serial", event.target.value)} required />
        </Field>
        <Field label="Tipo">
          <TextInput value={form.type} onChange={(event) => update("type", event.target.value)} required placeholder="Laptop, telefono, impresora" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Marca">
          <TextInput value={form.brand} onChange={(event) => update("brand", event.target.value)} required />
        </Field>
        <Field label="Modelo">
          <TextInput value={form.model} onChange={(event) => update("model", event.target.value)} required />
        </Field>
      </div>
      <Field label="Condicion">
        <TextInput value={form.condition} onChange={(event) => update("condition", event.target.value)} />
      </Field>
      <Field label="Estado">
        <SelectInput value={form.status} onChange={(event) => update("status", event.target.value)}>
          {orderStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </SelectInput>
      </Field>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
}

function CreateUserForm({ token, defaultRole = "tecnico", initialData = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    password: "",
    role: initialData?.role ?? defaultRole,
    status: initialData?.status ?? "Disponible",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (initialData) {
        await updateUser(token, initialData.id, form);
      } else {
        await createUser(token, form);
      }
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormError message={error} />
      <Field label="Nombre">
        <TextInput value={form.name} onChange={(event) => update("name", event.target.value)} required />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Correo">
          <TextInput type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        </Field>
        <Field label="Contrasena">
          <TextInput
            type="password"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            required={!initialData}
            placeholder={initialData ? "Dejar vacia para conservarla" : ""}
          />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Rol">
          <SelectInput value={form.role} onChange={(event) => update("role", event.target.value)}>
            <option value="admin">Administrador</option>
            <option value="tecnico">Tecnico</option>
          </SelectInput>
        </Field>
        <Field label="Estado">
          <SelectInput value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
          </SelectInput>
        </Field>
      </div>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
}

function CreateOrderForm({ token, clients, devices, users, initialData = null, onSaved, onCancel }) {
  const techniciansList = users.filter((user) => user.role === "tecnico");
  const initialClientId = initialData?.clientId ?? devices[0]?.clientId ?? clients[0]?.id ?? "";
  const initialDeviceId =
    initialData?.deviceId ??
    devices.find((device) => Number(device.clientId) === Number(initialClientId))?.id ??
    "";
  const [form, setForm] = useState({
    code: initialData?.code ?? `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    clientId: initialClientId,
    deviceId: initialDeviceId,
    issue: initialData?.issue ?? "",
    diagnosis: initialData?.diagnosis ?? "",
    technicianId: initialData?.technicianId ?? techniciansList[0]?.id ?? "",
    status: initialData?.status ?? "Pendiente",
    entryDate: initialData?.entryDate ?? new Date().toISOString().slice(0, 10),
    deliveryDate: initialData?.deliveryDate ?? "",
    cost: initialData?.cost ?? 0,
    notes: initialData?.notes ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const compatibleDevices = devices.filter(
    (device) => Number(device.clientId) === Number(form.clientId)
  );

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateClient(value) {
    const nextDevice = devices.find((device) => Number(device.clientId) === Number(value));
    setForm((current) => ({
      ...current,
      clientId: value,
      deviceId: nextDevice?.id ?? "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        clientId: Number(form.clientId),
        deviceId: Number(form.deviceId),
        technicianId: form.technicianId ? Number(form.technicianId) : null,
        deliveryDate: form.deliveryDate || null,
        cost: Number(form.cost),
      };
      if (initialData) {
        await updateOrder(token, initialData.id, payload);
      } else {
        await createOrder(token, payload);
      }
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!clients.length || !devices.length) {
    return (
      <EmptyState
        title="Faltan datos base"
        description="Para crear una orden necesitas al menos un cliente y un equipo registrados."
      />
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormError message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Codigo de orden">
          <TextInput value={form.code} onChange={(event) => update("code", event.target.value)} required />
        </Field>
        <Field label="Estado">
          <SelectInput value={form.status} onChange={(event) => update("status", event.target.value)}>
            {orderStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Cliente">
          <SelectInput value={form.clientId} onChange={(event) => updateClient(event.target.value)} required>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Equipo">
          <SelectInput value={form.deviceId} onChange={(event) => update("deviceId", event.target.value)} required>
            {compatibleDevices.map((device) => (
              <option key={device.id} value={device.id}>
                {[device.brand, device.model, device.serial].filter(Boolean).join(" - ")}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <Field label="Tecnico asignado">
        <SelectInput value={form.technicianId} onChange={(event) => update("technicianId", event.target.value)}>
          <option value="">Sin asignar</option>
          {techniciansList.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Falla reportada">
        <TextAreaInput value={form.issue} onChange={(event) => update("issue", event.target.value)} />
      </Field>
      <Field label="Diagnostico">
        <TextAreaInput value={form.diagnosis} onChange={(event) => update("diagnosis", event.target.value)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Ingreso">
          <TextInput type="date" value={form.entryDate} onChange={(event) => update("entryDate", event.target.value)} required />
        </Field>
        <Field label="Entrega">
          <TextInput type="date" value={form.deliveryDate} onChange={(event) => update("deliveryDate", event.target.value)} />
        </Field>
        <Field label="Costo">
          <TextInput type="number" min="0" step="0.01" value={form.cost} onChange={(event) => update("cost", event.target.value)} />
        </Field>
      </div>
      <Field label="Observaciones">
        <TextAreaInput value={form.notes} onChange={(event) => update("notes", event.target.value)} />
      </Field>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
}

function InventoryLive({ token }) {
  const { data = [], isLoading, error, reload } = useApiData(getInventory, token);
  const [modalOpen, setModalOpen] = useState(false);
  const crud = useCrudActions(token, deleteInventoryItem, reload);
  const items = data ?? [];
  const lowStockCount = items.filter((item) => item.status === "Stock bajo").length;
  const totalValue = items.reduce((total, item) => total + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0);

  return (
    <SectionShell
      buttonLabel="Nuevo repuesto"
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={[
        ["Total repuestos", items.length],
        ["Stock bajo", lowStockCount],
        ["Valor estimado", formatMoney(totalValue)],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Listado de repuestos">
        <LiveTable
          columns={["Codigo", "Nombre", "Categoria", "Cantidad", "Stock minimo", "Precio", "Ubicacion", "Estado", "Acciones"]}
          rows={items.map((item) => [
            item.code,
            item.name,
            item.category ?? "-",
            item.quantity,
            item.minStock,
            formatMoney(item.price),
            item.location ?? "-",
            <Badge key={item.id ?? item.code} label={item.status} />,
            <CrudActions
              key={`actions-${item.id}`}
              onView={() => crud.setViewing(item)}
              onEdit={() => crud.setEditing(item)}
              onDelete={() => crud.requestDelete(item)}
            />,
          ])}
          emptyTitle="Inventario sin repuestos"
          emptyDescription="Aun no hay repuestos registrados en la base de datos."
        />
      </Panel>
      <Modal title="Nuevo repuesto" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateInventoryForm
          token={token}
          onCancel={() => setModalOpen(false)}
          onSaved={async () => {
            await reload();
            setModalOpen(false);
          }}
        />
      </Modal>
      <Modal title="Detalle del repuesto" open={Boolean(crud.viewing)} onClose={() => crud.setViewing(null)}>
        {crud.viewing && (
          <DetailGrid
            items={[
              { label: "Codigo", value: crud.viewing.code },
              { label: "Nombre", value: crud.viewing.name },
              { label: "Categoria", value: crud.viewing.category },
              { label: "Ubicacion", value: crud.viewing.location },
              { label: "Cantidad", value: crud.viewing.quantity },
              { label: "Stock minimo", value: crud.viewing.minStock },
              { label: "Precio", value: formatMoney(crud.viewing.price) },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
            ]}
          />
        )}
      </Modal>
      <Modal title="Editar repuesto" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)}>
        {crud.editing && (
          <CreateInventoryForm
            token={token}
            initialData={crud.editing}
            onCancel={() => crud.setEditing(null)}
            onSaved={async () => {
              await reload();
              crud.setEditing(null);
            }}
          />
        )}
      </Modal>
      <DeleteConfirmation
        open={Boolean(crud.deleting)}
        name={crud.deleting?.name}
        isDeleting={crud.isDeleting}
        error={crud.deleteError}
        onClose={crud.closeDelete}
        onConfirm={crud.confirmDelete}
      />
    </SectionShell>
  );
}

function OrdersLive({ token }) {
  const { data = [], isLoading, error, reload } = useApiData(getOrders, token);
  const { data: clientsData = [] } = useApiData(getClients, token);
  const { data: devicesData = [] } = useApiData(getDevices, token);
  const { data: usersData = [] } = useApiData(getUsers, token);
  const [modalOpen, setModalOpen] = useState(false);
  const crud = useCrudActions(token, deleteOrder, reload);
  const items = data ?? [];
  const clientsList = clientsData ?? [];
  const devicesList = devicesData ?? [];
  const usersList = usersData ?? [];
  const pending = items.filter((order) => order.status === "Pendiente").length;
  const inRepair = items.filter((order) => order.status === "En reparacion" || order.status === "En reparación").length;
  const finished = items.filter((order) => ["Finalizado", "Entregado"].includes(order.status)).length;

  return (
    <SectionShell
      buttonLabel="Nueva orden"
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={[
        ["Pendientes", pending],
        ["En reparacion", inRepair],
        ["Finalizadas", finished],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Ordenes activas">
        <LiveTable
          columns={[
            "Codigo",
            "Cliente",
            "Equipo",
            "Falla reportada",
            "Diagnostico",
            "Tecnico",
            "Repuestos",
            "Estado",
            "Ingreso",
            "Entrega",
            "Costo",
            "Observaciones",
            "Acciones",
          ]}
          rows={items.map((order) => [
            order.code,
            order.client?.name ?? "Sin cliente",
            [order.device?.brand, order.device?.model].filter(Boolean).join(" ") || "Sin equipo",
            order.issue ?? "-",
            order.diagnosis ?? "-",
            order.technician?.name ?? "Sin asignar",
            order.partsUsed?.length
              ? order.partsUsed.map((part) => part.inventoryItem?.name).filter(Boolean).join(", ")
              : "-",
            <Badge key={order.id ?? order.code} label={order.status} />,
            formatDate(order.entryDate),
            formatDate(order.deliveryDate),
            formatMoney(order.cost),
            order.notes ?? "-",
            <CrudActions
              key={`actions-${order.id}`}
              onView={() => crud.setViewing(order)}
              onEdit={() => crud.setEditing(order)}
              onDelete={() => crud.requestDelete(order)}
            />,
          ])}
          emptyTitle="Sin ordenes de reparacion"
          emptyDescription="Cuando se registre la primera orden, aparecera en esta tabla."
        />
      </Panel>
      <Modal title="Nueva orden de reparacion" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateOrderForm
          token={token}
          clients={clientsList}
          devices={devicesList}
          users={usersList}
          onCancel={() => setModalOpen(false)}
          onSaved={async () => {
            await reload();
            setModalOpen(false);
          }}
        />
      </Modal>
      <Modal title="Detalle de la orden" open={Boolean(crud.viewing)} onClose={() => crud.setViewing(null)}>
        {crud.viewing && (
          <DetailGrid
            items={[
              { label: "Codigo", value: crud.viewing.code },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
              { label: "Cliente", value: crud.viewing.client?.name },
              {
                label: "Equipo",
                value: [crud.viewing.device?.brand, crud.viewing.device?.model, crud.viewing.device?.serial]
                  .filter(Boolean)
                  .join(" - "),
              },
              { label: "Tecnico", value: crud.viewing.technician?.name ?? "Sin asignar" },
              { label: "Costo", value: formatMoney(crud.viewing.cost) },
              { label: "Ingreso", value: formatDate(crud.viewing.entryDate) },
              { label: "Entrega", value: formatDate(crud.viewing.deliveryDate) },
              { label: "Falla reportada", value: crud.viewing.issue, wide: true },
              { label: "Diagnostico", value: crud.viewing.diagnosis, wide: true },
              {
                label: "Repuestos utilizados",
                value: crud.viewing.partsUsed?.length
                  ? crud.viewing.partsUsed
                      .map((part) => `${part.inventoryItem?.name ?? "Repuesto"} (${part.quantityUsed})`)
                      .join(", ")
                  : "Sin repuestos",
                wide: true,
              },
              { label: "Observaciones", value: crud.viewing.notes, wide: true },
            ]}
          />
        )}
      </Modal>
      <Modal title="Editar orden de reparacion" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)}>
        {crud.editing && (
          <CreateOrderForm
            token={token}
            clients={clientsList}
            devices={devicesList}
            users={usersList}
            initialData={crud.editing}
            onCancel={() => crud.setEditing(null)}
            onSaved={async () => {
              await reload();
              crud.setEditing(null);
            }}
          />
        )}
      </Modal>
      <DeleteConfirmation
        open={Boolean(crud.deleting)}
        name={crud.deleting?.code}
        isDeleting={crud.isDeleting}
        error={crud.deleteError}
        onClose={crud.closeDelete}
        onConfirm={crud.confirmDelete}
      />
    </SectionShell>
  );
}

function ClientsLive({ token }) {
  const { data = [], isLoading, error, reload } = useApiData(getClients, token);
  const [modalOpen, setModalOpen] = useState(false);
  const crud = useCrudActions(token, deleteClient, reload);
  const items = data ?? [];
  const companies = items.filter((client) => client.type === "Empresa").length;

  return (
    <SectionShell
      buttonLabel="Nuevo cliente"
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={[
        ["Clientes activos", items.length],
        ["Empresas", companies],
        ["Individuales", items.length - companies],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Directorio de clientes">
        <LiveTable
          columns={["Nombre", "Telefono", "Correo", "Tipo", "Registrado", "Acciones"]}
          rows={items.map((client) => [
            client.name,
            client.phone ?? "-",
            client.email ?? "-",
            client.type,
            formatDate(client.createdAt),
            <CrudActions
              key={`actions-${client.id}`}
              onView={() => crud.setViewing(client)}
              onEdit={() => crud.setEditing(client)}
              onDelete={() => crud.requestDelete(client)}
            />,
          ])}
          emptyTitle="Sin clientes"
          emptyDescription="Aun no hay clientes registrados en la base de datos."
        />
      </Panel>
      <Modal title="Nuevo cliente" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateClientForm
          token={token}
          onCancel={() => setModalOpen(false)}
          onSaved={async () => {
            await reload();
            setModalOpen(false);
          }}
        />
      </Modal>
      <Modal title="Detalle del cliente" open={Boolean(crud.viewing)} onClose={() => crud.setViewing(null)}>
        {crud.viewing && (
          <DetailGrid
            items={[
              { label: "Nombre", value: crud.viewing.name },
              { label: "Tipo", value: crud.viewing.type },
              { label: "Telefono", value: crud.viewing.phone },
              { label: "Correo", value: crud.viewing.email },
              { label: "Registrado", value: formatDate(crud.viewing.createdAt) },
              { label: "Ultima actualizacion", value: formatDate(crud.viewing.updatedAt) },
            ]}
          />
        )}
      </Modal>
      <Modal title="Editar cliente" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)}>
        {crud.editing && (
          <CreateClientForm
            token={token}
            initialData={crud.editing}
            onCancel={() => crud.setEditing(null)}
            onSaved={async () => {
              await reload();
              crud.setEditing(null);
            }}
          />
        )}
      </Modal>
      <DeleteConfirmation
        open={Boolean(crud.deleting)}
        name={crud.deleting?.name}
        isDeleting={crud.isDeleting}
        error={crud.deleteError}
        onClose={crud.closeDelete}
        onConfirm={crud.confirmDelete}
      />
    </SectionShell>
  );
}

function DevicesLive({ token }) {
  const { data = [], isLoading, error, reload } = useApiData(getDevices, token);
  const { data: clientsData = [] } = useApiData(getClients, token);
  const [modalOpen, setModalOpen] = useState(false);
  const crud = useCrudActions(token, deleteDevice, reload);
  const items = data ?? [];
  const clientsList = clientsData ?? [];
  const inShop = items.filter((device) => !["Entregado", "Cancelado"].includes(device.status)).length;

  return (
    <SectionShell
      buttonLabel="Registrar equipo"
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={[
        ["Equipos ingresados", items.length],
        ["En taller", inShop],
        ["Cerrados", items.length - inShop],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Equipos electronicos">
        <LiveTable
          columns={["Serie", "Tipo", "Marca", "Modelo", "Propietario", "Condicion", "Estado", "Acciones"]}
          rows={items.map((device) => [
            device.serial,
            device.type,
            device.brand,
            device.model,
            device.owner?.name ?? "Sin propietario",
            device.condition ?? "-",
            <Badge key={device.id ?? device.serial} label={device.status} />,
            <CrudActions
              key={`actions-${device.id}`}
              onView={() => crud.setViewing(device)}
              onEdit={() => crud.setEditing(device)}
              onDelete={() => crud.requestDelete(device)}
            />,
          ])}
          emptyTitle="Sin equipos"
          emptyDescription="Los equipos registrados desde recepcion apareceran aqui."
        />
      </Panel>
      <Modal title="Registrar equipo" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateDeviceForm
          token={token}
          clients={clientsList}
          onCancel={() => setModalOpen(false)}
          onSaved={async () => {
            await reload();
            setModalOpen(false);
          }}
        />
      </Modal>
      <Modal title="Detalle del equipo" open={Boolean(crud.viewing)} onClose={() => crud.setViewing(null)}>
        {crud.viewing && (
          <DetailGrid
            items={[
              { label: "Serie", value: crud.viewing.serial },
              { label: "Tipo", value: crud.viewing.type },
              { label: "Marca", value: crud.viewing.brand },
              { label: "Modelo", value: crud.viewing.model },
              { label: "Propietario", value: crud.viewing.owner?.name },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
              { label: "Condicion de ingreso", value: crud.viewing.condition, wide: true },
            ]}
          />
        )}
      </Modal>
      <Modal title="Editar equipo" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)}>
        {crud.editing && (
          <CreateDeviceForm
            token={token}
            clients={clientsList}
            initialData={crud.editing}
            onCancel={() => crud.setEditing(null)}
            onSaved={async () => {
              await reload();
              crud.setEditing(null);
            }}
          />
        )}
      </Modal>
      <DeleteConfirmation
        open={Boolean(crud.deleting)}
        name={`${crud.deleting?.brand ?? ""} ${crud.deleting?.model ?? ""}`.trim()}
        isDeleting={crud.isDeleting}
        error={crud.deleteError}
        onClose={crud.closeDelete}
        onConfirm={crud.confirmDelete}
      />
    </SectionShell>
  );
}

function TechniciansLive({ token }) {
  const { data = [], isLoading, error, reload } = useApiData(getUsers, token);
  const [modalOpen, setModalOpen] = useState(false);
  const crud = useCrudActions(token, deleteUser, reload);
  const techniciansList = (data ?? []).filter((user) => user.role === "tecnico");

  return (
    <SectionShell
      buttonLabel="Nuevo tecnico"
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={[
        ["Tecnicos", techniciansList.length],
        ["Disponibles", techniciansList.filter((user) => user.status === "Disponible").length],
        ["Ocupados", techniciansList.filter((user) => user.status === "Ocupada").length],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      {techniciansList.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {techniciansList.map((tech) => (
            <article key={tech.id} className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded bg-teal-50 text-teal-700">
                  <Wrench className="h-5 w-5" />
                </div>
                <Badge label={tech.status} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{tech.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{tech.email}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Ultimo acceso
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">{formatDate(tech.lastAccess)}</p>
              <div className="mt-4 flex justify-end border-t border-line pt-3">
                <CrudActions
                  onView={() => crud.setViewing(tech)}
                  onEdit={() => crud.setEditing(tech)}
                  onDelete={() => crud.requestDelete(tech)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Sin tecnicos" description="Aun no hay usuarios tecnicos registrados." />
      )}
      <Modal title="Nuevo tecnico" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateUserForm
          token={token}
          defaultRole="tecnico"
          onCancel={() => setModalOpen(false)}
          onSaved={async () => {
            await reload();
            setModalOpen(false);
          }}
        />
      </Modal>
      <Modal title="Detalle del tecnico" open={Boolean(crud.viewing)} onClose={() => crud.setViewing(null)}>
        {crud.viewing && (
          <DetailGrid
            items={[
              { label: "Nombre", value: crud.viewing.name },
              { label: "Correo", value: crud.viewing.email },
              { label: "Rol", value: getRoleLabel(crud.viewing.role) },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
              { label: "Ultimo acceso", value: formatDate(crud.viewing.lastAccess) },
              { label: "Registrado", value: formatDate(crud.viewing.createdAt) },
            ]}
          />
        )}
      </Modal>
      <Modal title="Editar tecnico" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)}>
        {crud.editing && (
          <CreateUserForm
            token={token}
            defaultRole="tecnico"
            initialData={crud.editing}
            onCancel={() => crud.setEditing(null)}
            onSaved={async () => {
              await reload();
              crud.setEditing(null);
            }}
          />
        )}
      </Modal>
      <DeleteConfirmation
        open={Boolean(crud.deleting)}
        name={crud.deleting?.name}
        isDeleting={crud.isDeleting}
        error={crud.deleteError}
        onClose={crud.closeDelete}
        onConfirm={crud.confirmDelete}
      />
    </SectionShell>
  );
}

function MaintenanceHistoryLive({ token }) {
  const { data = [], isLoading, error } = useApiData(getHistory, token);
  const items = data ?? [];

  return (
    <SectionShell
      buttonLabel="Exportar"
      icon={FileText}
      summary={[
        ["Eventos", items.length],
        ["Hoy", 0],
        ["Auditoria", "Activa"],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Trazabilidad de mantenimiento">
        {items.length ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded border border-line bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded bg-brand-50 text-brand-700">
                      <History className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{item.event}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.detail ?? "-"}</p>
                    </div>
                  </div>
                  <div className="text-left text-sm sm:text-right">
                    <p className="font-medium text-slate-700">{item.order?.code ?? "Sin orden"}</p>
                    <p className="text-slate-500">{formatDate(item.createdAt)}</p>
                    <p className="text-slate-500">{item.author?.name ?? "Sistema"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin historial" description="Las acciones de mantenimiento apareceran en esta vista." />
        )}
      </Panel>
    </SectionShell>
  );
}

function ReportsLive({ token }) {
  const { data, isLoading, error } = useApiData(getReports, token);
  const byMonth = data?.byMonth ?? [];
  const byStatus = data?.byStatus ?? [];
  const byTechnician = data?.byTechnician ?? [];
  const mostUsedParts = data?.mostUsedParts ?? [];
  const lowStock = data?.lowStock ?? [];
  const estimatedIncome = Number(data?.estimatedIncome?.estimatedIncome ?? 0);

  return (
    <SectionShell
      buttonLabel="Generar reporte"
      icon={FileText}
      summary={[
        ["Ingresos estimados", formatMoney(estimatedIncome)],
        ["Repuestos usados", mostUsedParts.length],
        ["Bajo stock", lowStock.length],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <div className="grid gap-6 xl:grid-cols-2">
        <ReportPanel title="Reparaciones por mes" rows={byMonth} labelKey="month" valueKey="total" />
        <ReportPanel title="Ordenes por estado" rows={byStatus} labelKey="status" valueKey="total" />
        <ReportPanel title="Reparaciones por tecnico" rows={byTechnician} labelKey="technician.name" valueKey="total" />
        <ReportPanel title="Repuestos mas usados" rows={mostUsedParts} labelKey="inventoryItem.name" valueKey="totalUsed" />
      </div>
    </SectionShell>
  );
}

function ReportPanel({ title, rows, labelKey, valueKey }) {
  const max = Math.max(...rows.map((row) => Number(row[valueKey] ?? 0)), 1);

  return (
    <Panel title={title}>
      {rows.length ? (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const label = getNestedValue(row, labelKey) ?? "Sin dato";
            const value = Number(row[valueKey] ?? 0);
            return (
              <div key={`${label}-${index}`}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className="text-slate-500">{value}</span>
                </div>
                <div className="h-3 rounded bg-slate-100">
                  <div className="h-full rounded bg-brand-500" style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Sin datos para reporte" description="Este reporte se llenara cuando existan operaciones." />
      )}
    </Panel>
  );
}

function getNestedValue(row, path) {
  if (Object.prototype.hasOwnProperty.call(row, path)) {
    return row[path];
  }
  return path.split(".").reduce((value, key) => value?.[key], row);
}

function UsersLive({ token }) {
  const { data = [], isLoading, error, reload } = useApiData(getUsers, token);
  const [modalOpen, setModalOpen] = useState(false);
  const crud = useCrudActions(token, deleteUser, reload);
  const items = data ?? [];
  const admins = items.filter((user) => user.role === "admin").length;

  return (
    <SectionShell
      buttonLabel="Nuevo usuario"
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={[
        ["Administradores", admins],
        ["Tecnicos", items.filter((user) => user.role === "tecnico").length],
        ["Usuarios", items.length],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Usuarios del sistema">
        <LiveTable
          columns={["Usuario", "Correo", "Rol", "Estado", "Ultimo acceso", "Acciones"]}
          rows={items.map((user) => [
            user.name,
            user.email,
            getRoleLabel(user.role),
            <Badge key={user.id} label={user.status} />,
            formatDate(user.lastAccess),
            <CrudActions
              key={`actions-${user.id}`}
              onView={() => crud.setViewing(user)}
              onEdit={() => crud.setEditing(user)}
              onDelete={() => crud.requestDelete(user)}
            />,
          ])}
          emptyTitle="Sin usuarios"
          emptyDescription="Crea el primer administrador para operar el sistema."
        />
      </Panel>
      <Modal title="Nuevo usuario" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateUserForm
          token={token}
          defaultRole="tecnico"
          onCancel={() => setModalOpen(false)}
          onSaved={async () => {
            await reload();
            setModalOpen(false);
          }}
        />
      </Modal>
      <Modal title="Detalle del usuario" open={Boolean(crud.viewing)} onClose={() => crud.setViewing(null)}>
        {crud.viewing && (
          <DetailGrid
            items={[
              { label: "Nombre", value: crud.viewing.name },
              { label: "Correo", value: crud.viewing.email },
              { label: "Rol", value: getRoleLabel(crud.viewing.role) },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
              { label: "Ultimo acceso", value: formatDate(crud.viewing.lastAccess) },
              { label: "Registrado", value: formatDate(crud.viewing.createdAt) },
            ]}
          />
        )}
      </Modal>
      <Modal title="Editar usuario" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)}>
        {crud.editing && (
          <CreateUserForm
            token={token}
            initialData={crud.editing}
            onCancel={() => crud.setEditing(null)}
            onSaved={async () => {
              await reload();
              crud.setEditing(null);
            }}
          />
        )}
      </Modal>
      <DeleteConfirmation
        open={Boolean(crud.deleting)}
        name={crud.deleting?.name}
        isDeleting={crud.isDeleting}
        error={crud.deleteError}
        onClose={crud.closeDelete}
        onConfirm={crud.confirmDelete}
      />
    </SectionShell>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <Panel
          title="Últimas órdenes registradas"
          action={
            <button className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" />
              Filtrar
            </button>
          }
        >
          <ResponsiveTable
            columns={["Orden", "Cliente", "Equipo", "Técnico", "Estado", "Costo"]}
            rows={orders.map((order) => [
              order.code,
              order.client,
              order.device,
              order.technician,
              <Badge key={order.code} label={order.status} />,
              order.cost,
            ])}
          />
        </Panel>

        <Panel title="Alertas de inventario">
          <div className="space-y-3">
            {inventory
              .filter((item) => item.status === "Stock bajo")
              .map((item) => (
                <div key={item.code} className="rounded border border-line bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-rose-50 text-rose-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-ink">{item.name}</p>
                        <Badge label="Stock bajo" />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        Existencia {item.quantity} / mínimo {item.min}. Ubicación {item.location}.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <MiniPanel icon={PackageCheck} label="Repuestos con stock bajo" value="18" tone="rose" />
        <MiniPanel icon={Gauge} label="Productividad semanal" value="91%" tone="teal" />
        <MiniPanel icon={FileClock} label="Tiempo promedio" value="2.4 días" tone="blue" />
      </div>
    </div>
  );
}

function Inventory() {
  return (
    <SectionShell
      buttonLabel="Nuevo repuesto"
      icon={Plus}
      summary={[
        ["Total repuestos", "428"],
        ["Stock bajo", "18"],
        ["Valor estimado", "Q 84,250"],
      ]}
    >
      <Panel title="Listado de repuestos">
        <ResponsiveTable
          columns={["Código", "Nombre", "Categoría", "Cantidad", "Stock mínimo", "Precio", "Ubicación", "Estado"]}
          rows={inventory.map((item) => [
            item.code,
            item.name,
            item.category,
            item.quantity,
            item.min,
            item.price,
            item.location,
            <Badge key={item.code} label={item.status} />,
          ])}
        />
      </Panel>
    </SectionShell>
  );
}

function Orders() {
  return (
    <SectionShell
      buttonLabel="Nueva orden"
      icon={Plus}
      summary={[
        ["Pendientes", "32"],
        ["En reparación", "47"],
        ["Finalizadas", "169"],
      ]}
    >
      <Panel title="Órdenes activas">
        <ResponsiveTable
          columns={[
            "Código",
            "Cliente",
            "Equipo",
            "Falla reportada",
            "Diagnóstico",
            "Técnico",
            "Repuestos",
            "Estado",
            "Ingreso",
            "Entrega",
            "Costo",
            "Observaciones",
          ]}
          rows={orders.map((order) => [
            order.code,
            order.client,
            order.device,
            order.issue,
            order.diagnosis,
            order.technician,
            order.parts,
            <Badge key={order.code} label={order.status} />,
            order.entry,
            order.delivery,
            order.cost,
            order.notes,
          ])}
        />
      </Panel>
    </SectionShell>
  );
}

function Clients() {
  return (
    <SectionShell
      buttonLabel="Nuevo cliente"
      icon={Plus}
      summary={[
        ["Clientes activos", "126"],
        ["Empresas", "22"],
        ["Visitas del mes", "61"],
      ]}
    >
      <Panel title="Directorio de clientes">
        <ResponsiveTable
          columns={["Nombre", "Teléfono", "Correo", "Órdenes", "Última visita", "Tipo"]}
          rows={clients.map((client) => [
            client.name,
            client.phone,
            client.email,
            client.orders,
            client.lastVisit,
            client.type,
          ])}
        />
      </Panel>
    </SectionShell>
  );
}

function Devices() {
  return (
    <SectionShell
      buttonLabel="Registrar equipo"
      icon={Plus}
      summary={[
        ["Equipos ingresados", "214"],
        ["En taller", "83"],
        ["Entregados", "131"],
      ]}
    >
      <Panel title="Equipos electrónicos">
        <ResponsiveTable
          columns={["Serie", "Tipo", "Marca", "Modelo", "Propietario", "Condición", "Estado"]}
          rows={devices.map((device) => [
            device.serial,
            device.type,
            device.brand,
            device.model,
            device.owner,
            device.condition,
            <Badge key={device.serial} label={device.status} />,
          ])}
        />
      </Panel>
    </SectionShell>
  );
}

function Technicians() {
  return (
    <SectionShell
      buttonLabel="Nuevo técnico"
      icon={Plus}
      summary={[
        ["Técnicos", "14"],
        ["Órdenes asignadas", "47"],
        ["Rendimiento medio", "92%"],
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {technicians.map((tech) => (
          <article key={tech.name} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-11 w-11 place-items-center rounded bg-teal-50 text-teal-700">
                <Wrench className="h-5 w-5" />
              </div>
              <Badge label={tech.availability} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">{tech.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{tech.specialty}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Metric label="Activas" value={tech.activeOrders} />
              <Metric label="Finalizadas" value={tech.completed} />
              <Metric label="Calidad" value={tech.performance} />
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function MaintenanceHistory() {
  return (
    <SectionShell
      buttonLabel="Exportar"
      icon={FileText}
      summary={[
        ["Eventos", "642"],
        ["Hoy", "18"],
        ["Auditoría", "Activa"],
      ]}
    >
      <Panel title="Trazabilidad de mantenimiento">
        <div className="space-y-4">
          {history.map((item) => (
            <div key={`${item.order}-${item.date}`} className="rounded border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded bg-brand-50 text-brand-700">
                    <History className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{item.event}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                </div>
                <div className="text-left text-sm sm:text-right">
                  <p className="font-medium text-slate-700">{item.order}</p>
                  <p className="text-slate-500">{item.date}</p>
                  <p className="text-slate-500">{item.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

function Reports() {
  const income = useMemo(
    () => orders.reduce((total, order) => total + Number(order.cost.replace(/[^\d.]/g, "")), 0),
    []
  );

  return (
    <SectionShell
      buttonLabel="Generar reporte"
      icon={FileText}
      summary={[
        ["Ingresos estimados", `Q ${income.toLocaleString("es-GT")}`],
        ["Repuestos usados", "132"],
        ["Mes actual", "Julio 2026"],
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Indicadores principales">
          <div className="space-y-5">
            {reports.map((report) => (
              <div key={report.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{report.label}</span>
                  <span className="text-slate-500">{report.value}%</span>
                </div>
                <div className="h-3 rounded bg-slate-100">
                  <div
                    className={`h-full rounded ${report.color}`}
                    style={{ width: `${(report.value / report.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Resumen por estado">
          <div className="grid grid-cols-2 gap-3">
            {["Pendiente", "En diagnóstico", "En reparación", "Esperando repuesto", "Finalizado", "Entregado"].map(
              (status, index) => (
                <div key={status} className="rounded border border-line bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">{status}</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{[32, 12, 47, 9, 41, 128][index]}</p>
                </div>
              )
            )}
          </div>
        </Panel>
      </div>
    </SectionShell>
  );
}

function UsersModule() {
  return (
    <SectionShell
      buttonLabel="Nuevo usuario"
      icon={Plus}
      summary={[
        ["Administradores", "3"],
        ["Técnicos", "14"],
        ["Roles", "4"],
      ]}
    >
      <Panel title="Usuarios del sistema">
        <ResponsiveTable
          columns={["Usuario", "Correo", "Rol", "Estado", "Último acceso"]}
          rows={[
            ["Admin MB", "admin@tallermb.gt", "Administrador", <Badge key="u1" label="Disponible" />, "08/07/2026"],
            ["Carlos Méndez", "carlos@tallermb.gt", "Técnico", <Badge key="u2" label="Disponible" />, "08/07/2026"],
            ["Andrea Ruiz", "andrea@tallermb.gt", "Técnico", <Badge key="u3" label="Ocupada" />, "07/07/2026"],
          ]}
        />
      </Panel>
    </SectionShell>
  );
}

function SettingsModule() {
  return (
    <SectionShell
      buttonLabel="Guardar cambios"
      icon={CheckCircle2}
      summary={[
        ["Sucursal", "Central"],
        ["Moneda", "GTQ"],
        ["Alertas", "Activas"],
      ]}
    >
      <Panel title="Parámetros generales">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Nombre del taller", "Taller de Electrónicos MB"],
            ["Correo de notificaciones", "admin@tallermb.gt"],
            ["Stock mínimo por defecto", "5 unidades"],
            ["Tiempo objetivo de reparación", "3 días"],
          ].map(([label, value]) => (
            <label key={label} className="block">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                defaultValue={value}
                className="mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

function SectionShell({ children, buttonLabel, icon: Icon, summary, onAction }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          {summary.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Icon className="h-4 w-4" />
          {buttonLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon, tone }) {
  const tones = {
    blue: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
    teal: "bg-teal-50 text-teal-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-ink">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{change}</p>
    </article>
  );
}

function MiniPanel({ icon: Icon, label, value, tone }) {
  const tones = {
    rose: "bg-rose-50 text-rose-700",
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-brand-50 text-brand-700",
  };

  return (
    <article className="flex items-center gap-4 rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-ink">{value}</p>
      </div>
    </article>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold tracking-normal text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ResponsiveTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="whitespace-nowrap border-b border-line bg-slate-50 px-4 py-3 font-semibold text-slate-600 first:rounded-l last:rounded-r"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="max-w-64 border-b border-line px-4 py-3 align-top text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ label }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded px-2.5 py-1 text-xs font-semibold ring-1 ${
        statusStyles[label] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {label}
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded border border-line bg-slate-50 p-2">
      <p className="text-sm font-semibold text-ink">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

export default App;
