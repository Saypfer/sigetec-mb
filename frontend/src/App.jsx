import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Cpu,
  Download,
  FileClock,
  FileSpreadsheet,
  FileText,
  Gauge,
  History,
  Eye,
  EyeOff,
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
  addOrderObservation,
  addOrderPart,
  claimOrder,
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
  getOrder,
  getOrders,
  getReports,
  getUsers,
  loginUser,
  removeOrderPart,
  updateClient,
  updateDevice,
  updateInventoryItem,
  updateOrder,
  updateUser,
} from "./api";
import { getCompletedOrders } from "./completedOrders";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "tecnico"] },
  { id: "inventory", label: "Inventario", icon: Boxes, roles: ["admin", "tecnico"] },
  { id: "orders", label: "Órdenes", icon: ClipboardList, roles: ["admin", "tecnico"] },
  { id: "clients", label: "Clientes", icon: Users, roles: ["admin"] },
  { id: "devices", label: "Equipos", icon: Laptop, roles: ["admin"] },
  { id: "technicians", label: "Técnicos", icon: Wrench, roles: ["admin"] },
  { id: "history", label: "Historial", icon: History, roles: ["admin", "tecnico"] },
  { id: "reports", label: "Reportes", icon: BarChart3, roles: ["admin"] },
  { id: "users", label: "Usuarios", icon: ShieldCheck, roles: ["admin"] },
  { id: "settings", label: "Configuración", icon: Settings, roles: ["admin"] },
];

function canAccessModule(role, moduleId) {
  const item = navItems.find((navItem) => navItem.id === moduleId);
  return Boolean(item?.roles.includes(role));
}

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
    subtitle: "Órdenes finalizadas o entregadas y trazabilidad de eventos.",
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
const TOAST_EVENT = "sigetec:toast";

function showToast(message, type = "success") {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}

function ToastRegion() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timeoutId;
    function handleToast(event) {
      clearTimeout(timeoutId);
      setToast(event.detail);
      timeoutId = setTimeout(() => setToast(null), 4000);
    }
    window.addEventListener(TOAST_EVENT, handleToast);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener(TOAST_EVENT, handleToast);
    };
  }, []);

  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div
      className={`fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-soft ${
        isError ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
      role="status"
      aria-live="polite"
    >
      {isError ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}
      <p className="text-sm font-semibold">{toast.message}</p>
      <button type="button" onClick={() => setToast(null)} aria-label="Cerrar mensaje" className="ml-auto">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

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
      <ToastRegion />
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
          <ModuleRenderer activeModule={activeModule} token={session.token} user={session.user} />
        </main>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <div className="relative flex h-full flex-col p-12 text-white">
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
                  name="email"
                  autoComplete="email"
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
                  name="password"
                  autoComplete="current-password"
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
          {navItems.filter((item) => item.roles.includes(user?.role)).map((item) => {
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

function ModuleRenderer({ activeModule, token, user }) {
  if (!canAccessModule(user?.role, activeModule)) {
    return <AccessDenied />;
  }

  const modules = {
    dashboard: <DashboardLive token={token} />,
    inventory: <InventoryLive token={token} user={user} />,
    orders: <OrdersLive token={token} user={user} />,
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

function AccessDenied() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
        <div>
          <h2 className="font-semibold text-slate-800">Acceso restringido</h2>
          <p className="mt-1 text-sm text-slate-600">Tu usuario no tiene permisos para abrir este módulo.</p>
        </div>
      </div>
    </div>
  );
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

  const dashboardStats = [
    {
      label: "Ordenes registradas",
      value: dashboardData?.totalOrders ?? "—",
      change: "Total de órdenes",
      icon: FileText,
      tone: "blue",
    },
    {
      label: "Pendientes",
      value: dashboardData?.pendingOrders ?? "—",
      change: "Ordenes por iniciar",
      icon: CalendarClock,
      tone: "amber",
    },
    {
      label: "En reparación",
      value: dashboardData?.inRepairOrders ?? "—",
      change: "Trabajo activo",
      icon: Wrench,
      tone: "teal",
    },
    {
      label: "Finalizadas",
      value: dashboardData?.finishedOrders ?? "—",
      change: "Finalizadas o entregadas",
      icon: CheckCircle2,
      tone: "emerald",
    },
  ];

  const recentOrders = (dashboardData?.recentOrders ?? []).map((order) => ({
    code: order.code,
    client: order.client?.name ?? "Sin cliente",
    device: [order.device?.brand, order.device?.model].filter(Boolean).join(" ") || "Sin equipo",
    technician: order.technician?.name ?? "Sin asignar",
    status: order.status,
    cost: `Q ${Number(order.cost ?? 0).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  }));

  const lowStockItems = (dashboardData?.lowStockItems ?? []).map((item) => ({
    ...item,
    min: item.minStock,
  }));

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
                        Existencia {item.quantity} / mínimo {item.min}. Ubicación {item.location}.
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded border border-line bg-slate-50 p-4 text-sm text-slate-600">
                {dashboardData ? "No hay repuestos con stock bajo." : "Datos de inventario no disponibles."}
              </div>
            )}
          </div>
        </Panel>
      </div>

    </div>
  );
}

function useApiData(loader, token, enabled = true) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState("");

  const loadData = useMemo(
    () => async () => {
      if (!enabled) {
        setIsLoading(false);
        return [];
      }
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
    [enabled, loader, token]
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

    if (token && enabled) {
      loadInitialData();
    } else {
      setData(null);
      setIsLoading(false);
      setError("");
    }

    return () => {
      ignore = true;
    };
  }, [enabled, loader, token]);

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

function formatDateTime(value) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function downloadFile(content, fileName, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function exportReportExcel(report, filterLabels) {
  const indicators = report.indicators ?? {};
  const rows = [
    ["SIGETEC-MB - Reporte operativo"],
    ["Generado", new Date().toLocaleString("es-GT")],
    ["Desde", filterLabels.from],
    ["Hasta", filterLabels.to],
    ["Técnico", filterLabels.technician],
    ["Estado", filterLabels.status],
    [],
    ["INDICADORES"],
    ["Reparaciones", indicators.totalOrders ?? 0],
    ["Finalizadas", indicators.completedOrders ?? 0],
    ["Ingresos estimados", indicators.estimatedIncome ?? 0],
    ["Costo de repuestos", indicators.partsCost ?? 0],
    ["Utilidad estimada", indicators.estimatedProfit ?? 0],
    ["Ticket promedio", indicators.averageTicket ?? 0],
    [],
    ["REPARACIONES POR MES"],
    ["Mes", "Reparaciones", "Ingresos"],
    ...(report.byMonth ?? []).map((item) => [item.month, Number(item.total), Number(item.income)]),
    [],
    ["ÓRDENES POR ESTADO"],
    ["Estado", "Cantidad"],
    ...(report.byStatus ?? []).map((item) => [item.status, Number(item.total)]),
    [],
    ["REPARACIONES POR TÉCNICO"],
    ["Técnico", "Reparaciones", "Ingresos"],
    ...(report.byTechnician ?? []).map((item) => [item.name, Number(item.total), Number(item.income)]),
    [],
    ["REPUESTOS MÁS USADOS"],
    ["Código", "Repuesto", "Unidades", "Costo"],
    ...(report.mostUsedParts ?? []).map((item) => [item.code, item.name, Number(item.totalUsed), Number(item.totalCost)]),
    [],
    ["STOCK BAJO"],
    ["Código", "Repuesto", "Existencia", "Mínimo"],
    ...(report.lowStock ?? []).map((item) => [item.code, item.name, Number(item.quantity), Number(item.minStock)]),
  ];

  const table = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${escapeXml(cell)}</Data></Cell>`)
          .join("")}</Row>`
    )
    .join("");
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Reporte"><Table>${table}</Table></Worksheet>
</Workbook>`;
  downloadFile(workbook, `reporte-sigetec-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8");
}

function pdfSafeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/([\\()])/g, "\\$1")
    .slice(0, 100);
}

function createReportPdf(lines) {
  const content = ["BT", "/F1 10 Tf", "44 798 Td", "14 TL"]
    .concat(lines.slice(0, 52).map((line) => `(${pdfSafeText(line)}) Tj T*`), "ET")
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function exportReportPdf(report, filterLabels) {
  const indicators = report.indicators ?? {};
  const lines = [
    "SIGETEC-MB - REPORTE OPERATIVO",
    `Generado: ${new Date().toLocaleString("es-GT")}`,
    "",
    "FILTROS",
    `Desde: ${filterLabels.from} | Hasta: ${filterLabels.to}`,
    `Tecnico: ${filterLabels.technician} | Estado: ${filterLabels.status}`,
    "",
    "INDICADORES",
    `Reparaciones: ${indicators.totalOrders ?? 0} | Finalizadas: ${indicators.completedOrders ?? 0}`,
    `Ingresos estimados: ${formatMoney(indicators.estimatedIncome)}`,
    `Costo de repuestos: ${formatMoney(indicators.partsCost)}`,
    `Utilidad estimada: ${formatMoney(indicators.estimatedProfit)}`,
    `Ticket promedio: ${formatMoney(indicators.averageTicket)}`,
    "",
    "ORDENES POR ESTADO",
    ...(report.byStatus ?? []).map((item) => `${item.status}: ${item.total}`),
    "",
    "REPARACIONES POR TECNICO",
    ...(report.byTechnician ?? []).slice(0, 8).map((item) => `${item.name}: ${item.total} (${formatMoney(item.income)})`),
    "",
    "REPUESTOS MAS USADOS",
    ...(report.mostUsedParts ?? []).slice(0, 8).map((item) => `${item.code} - ${item.name}: ${item.totalUsed} uds. (${formatMoney(item.totalCost)})`),
  ];
  downloadFile(createReportPdf(lines), `reporte-sigetec-${new Date().toISOString().slice(0, 10)}.pdf`);
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

function EmptyState({ title = "Sin registros", description = "Cuando existan datos, aparecerán aquí." }) {
  return (
    <div className="rounded border border-dashed border-line bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Modal({ title, open, onClose, children, size = "md" }) {
  if (!open) return null;

  const sizes = {
    md: "max-w-2xl",
    lg: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className={`max-h-[90vh] w-full ${sizes[size]} overflow-y-auto rounded-lg border border-line bg-white shadow-soft`}>
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

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${className}`}
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

function FormActions({ isSubmitting, onCancel, formId }) {
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
        form={formId}
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

function getCellText(cell) {
  if (cell === null || cell === undefined) return "";
  if (["string", "number"].includes(typeof cell)) return String(cell);
  if (Array.isArray(cell)) return cell.map(getCellText).join(" ");
  if (cell?.props?.label) return String(cell.props.label);
  if (cell?.props?.children) return getCellText(cell.props.children);
  return "";
}

function normalizeSearchText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function LiveTable({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  filters = [],
  pageSize = 8,
  searchPlaceholder = "Buscar en el listado",
}) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());
    return rows.filter((row) => {
      const matchesSearch =
        !normalizedQuery ||
        normalizeSearchText(row.map(getCellText).join(" ")).includes(normalizedQuery);
      const matchesFilters = filters.every(({ column }) => {
        const selected = activeFilters[column];
        return !selected || getCellText(row[column]) === selected;
      });
      return matchesSearch && matchesFilters;
    });
  }, [activeFilters, filters, query, rows]);

  useEffect(() => setPage(1), [activeFilters, query, rows.length]);

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        {filters.map(({ label, column }) => {
          const options = [...new Set(rows.map((row) => getCellText(row[column])).filter(Boolean))].sort();
          return (
            <select
              key={`${label}-${column}`}
              value={activeFilters[column] ?? ""}
              onChange={(event) => setActiveFilters((current) => ({ ...current, [column]: event.target.value }))}
              className="rounded border border-line bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              aria-label={`Filtrar por ${label}`}
            >
              <option value="">{label}: todos</option>
              {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          );
        })}
      </div>

      {visibleRows.length ? (
        <ResponsiveTable columns={columns} rows={visibleRows} />
      ) : (
        <EmptyState title="Sin coincidencias" description="Prueba con otra búsqueda o limpia los filtros." />
      )}

      <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{filteredRows.length} de {rows.length} registros</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
            className="grid h-9 w-9 place-items-center rounded border border-line bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-20 text-center">{currentPage} de {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages}
            className="grid h-9 w-9 place-items-center rounded border border-line bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CollectionToolbar({ query, onQueryChange, placeholder, filterValue, onFilterChange, filterLabel, options }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      </div>
      <select
        value={filterValue}
        onChange={(event) => onFilterChange(event.target.value)}
        className="rounded border border-line bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        aria-label={`Filtrar por ${filterLabel}`}
      >
        <option value="">{filterLabel}: todos</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function PaginationFooter({ total, visible, page, totalPages, onPageChange }) {
  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>{visible} de {total} registros</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="grid h-9 w-9 place-items-center rounded border border-line bg-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center">{page} de {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="grid h-9 w-9 place-items-center rounded border border-line bg-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
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

function OrderRowActions({ isAdmin, isAssigned, isAvailable, isClaiming, onView, onEdit, onDelete, onClaim }) {
  if (isAdmin) {
    return <CrudActions onView={onView} onEdit={onEdit} onDelete={onDelete} />;
  }

  return (
    <div className="flex min-w-20 items-center justify-end gap-1">
      <ActionIconButton label="Ver orden" onClick={onView}>
        <Eye className="h-4 w-4" />
      </ActionIconButton>
      {isAssigned ? (
        <ActionIconButton label="Actualizar trabajo" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </ActionIconButton>
      ) : null}
      {isAvailable ? (
        <ActionIconButton label="Asignarme orden" onClick={onClaim} disabled={isClaiming}>
          <Wrench className="h-4 w-4" />
        </ActionIconButton>
      ) : null}
    </div>
  );
}

function ActionIconButton({ label, onClick, danger = false, disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded border transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
      showToast("Registro eliminado correctamente");
    } catch (error) {
      setDeleteError(error.message);
      showToast(error.message, "error");
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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateClientForm(form) {
  if (form.name.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (form.email && !isValidEmail(form.email.trim())) return "Ingresa un correo válido";
  if (form.phone && !/^\d{8}$/.test(form.phone)) return "El teléfono debe contener exactamente 8 números";
  return "";
}

function validateInventoryForm(form) {
  if (form.code.trim().length < 2) return "El código debe tener al menos 2 caracteres";
  if (form.name.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0) return "La cantidad debe ser un entero igual o mayor que cero";
  if (!Number.isInteger(Number(form.minStock)) || Number(form.minStock) < 0) return "El stock mínimo debe ser un entero igual o mayor que cero";
  if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) return "El precio debe ser igual o mayor que cero";
  return "";
}

function validateDeviceForm(form) {
  if (form.type.trim().length < 2) return "Ingresa el tipo de equipo";
  if (!form.clientId) return "Selecciona un cliente";
  return "";
}

function validateUserForm(form, isEditing) {
  if (form.name.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (!isValidEmail(form.email.trim())) return "Ingresa un correo válido";
  if (form.phone && !/^\d{8}$/.test(form.phone)) return "El teléfono debe contener exactamente 8 números";
  if ((!isEditing || form.password) && form.password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  return "";
}

function validateOrderForm(form) {
  if (form.code.trim().length < 3) return "Ingresa un código de orden válido";
  if (!form.clientId) return "Selecciona un cliente";
  if (!form.deviceId) return "Selecciona un equipo del cliente";
  if (!form.entryDate) return "Ingresa la fecha de recepción";
  if (form.deliveryDate && form.deliveryDate < form.entryDate) return "La entrega no puede ser anterior al ingreso";
  if (!Number.isFinite(Number(form.cost)) || Number(form.cost) < 0) return "El costo debe ser igual o mayor que cero";
  return "";
}

function CreateClientForm({ token, initialData = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    phone: String(initialData?.phone ?? "").replace(/\D/g, "").slice(0, 8),
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
    const validationError = validateClientForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
      };
      const savedClient = initialData
        ? await updateClient(token, initialData.id, payload)
        : await createClient(token, payload);
      showToast(initialData ? "Cliente actualizado correctamente" : "Cliente registrado correctamente");
      await onSaved(savedClient);
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
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
        <Field label="Teléfono">
          <TextInput
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={form.phone}
            onChange={(event) => update("phone", event.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="8 dígitos"
          />
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
    const validationError = validateInventoryForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        quantity: Number(form.quantity),
        minStock: Number(form.minStock),
        price: Number(form.price),
      };
      if (initialData) {
        await updateInventoryItem(token, initialData.id, payload);
      } else {
        await createInventoryItem(token, payload);
      }
      showToast(initialData ? "Repuesto actualizado correctamente" : "Repuesto registrado correctamente");
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormError message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Código">
          <TextInput value={form.code} onChange={(event) => update("code", event.target.value)} required />
        </Field>
        <Field label="Nombre del repuesto">
          <TextInput value={form.name} onChange={(event) => update("name", event.target.value)} required />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Categoría">
          <TextInput value={form.category} onChange={(event) => update("category", event.target.value)} />
        </Field>
        <Field label="Ubicación">
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

function CreateDeviceForm({ token, clients, defaultClientId = "", initialData = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    type: initialData?.type ?? "",
    brand: initialData?.brand ?? "",
    model: initialData?.model ?? "",
    condition: initialData?.condition ?? "",
    status: initialData?.status ?? "Pendiente",
    clientId: initialData?.clientId ?? (defaultClientId || clients[0]?.id || ""),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateDeviceForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        type: form.type.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        condition: form.condition.trim(),
        clientId: Number(form.clientId),
      };
      const savedDevice = initialData
        ? await updateDevice(token, initialData.id, payload)
        : await createDevice(token, payload);
      showToast(initialData ? "Equipo actualizado correctamente" : "Equipo registrado correctamente");
      await onSaved(savedDevice);
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
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
        <Field label="Tipo">
          <TextInput value={form.type} onChange={(event) => update("type", event.target.value)} required placeholder="Laptop, telefono, impresora" />
        </Field>
        <Field label="Marca">
          <TextInput value={form.brand} onChange={(event) => update("brand", event.target.value)} placeholder="Opcional" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Modelo">
          <TextInput value={form.model} onChange={(event) => update("model", event.target.value)} placeholder="Opcional" />
        </Field>
        <Field label="Condición">
          <TextInput value={form.condition} onChange={(event) => update("condition", event.target.value)} />
        </Field>
      </div>
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
    phone: String(initialData?.phone ?? "").replace(/\D/g, "").slice(0, 8),
    password: "",
    role: initialData?.role ?? defaultRole,
    status: initialData?.status ?? "Disponible",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateUserForm(form, Boolean(initialData));
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      };
      if (initialData) {
        await updateUser(token, initialData.id, payload);
      } else {
        await createUser(token, payload);
      }
      showToast(initialData ? "Usuario actualizado correctamente" : "Usuario registrado correctamente");
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
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
        <Field label="Teléfono">
          <TextInput
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={form.phone}
            onChange={(event) => update("phone", event.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="8 dígitos"
          />
        </Field>
      </div>
      <Field label="Contraseña">
        <div className="relative">
          <TextInput
            type={!initialData && showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            required={!initialData}
            placeholder={initialData ? "Dejar vacía para conservarla" : "Mínimo 8 caracteres"}
            className={!initialData ? "pr-11" : ""}
          />
          {!initialData ? (
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-4 grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Rol">
          <SelectInput value={form.role} onChange={(event) => update("role", event.target.value)}>
            <option value="admin">Administrador</option>
            <option value="tecnico">Técnico</option>
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

function CreateOrderForm({
  token,
  clients,
  devices,
  users,
  inventory = [],
  initialData = null,
  onClientCreated,
  onDeviceCreated,
  onSaved,
  onCancel,
}) {
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
  const [availableClients, setAvailableClients] = useState(clients);
  const [availableDevices, setAvailableDevices] = useState(devices);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [selectedParts, setSelectedParts] = useState([]);
  const firstStockItem = inventory.find((item) => Number(item.quantity) > 0);
  const [partDraft, setPartDraft] = useState({
    inventoryItemId: firstStockItem?.id ?? "",
    quantityUsed: 1,
  });
  const compatibleDevices = availableDevices.filter(
    (device) => Number(device.clientId) === Number(form.clientId)
  );
  const selectedPartsCost = selectedParts.reduce((total, part) => {
    const item = inventory.find((inventoryItem) => Number(inventoryItem.id) === Number(part.inventoryItemId));
    return total + Number(item?.price ?? 0) * Number(part.quantityUsed);
  }, 0);

  useEffect(() => setAvailableClients(clients), [clients]);
  useEffect(() => setAvailableDevices(devices), [devices]);
  useEffect(() => {
    if (!partDraft.inventoryItemId && firstStockItem) {
      setPartDraft((current) => ({ ...current, inventoryItemId: firstStockItem.id }));
    }
  }, [firstStockItem, partDraft.inventoryItemId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateClient(value) {
    const nextDevice = availableDevices.find((device) => Number(device.clientId) === Number(value));
    setForm((current) => ({
      ...current,
      clientId: value,
      deviceId: nextDevice?.id ?? "",
    }));
  }

  function addSelectedPart() {
    const inventoryItemId = Number(partDraft.inventoryItemId);
    const quantityUsed = Number(partDraft.quantityUsed);
    const item = inventory.find((inventoryItem) => Number(inventoryItem.id) === inventoryItemId);
    if (!item) {
      setError("Selecciona un repuesto disponible");
      return;
    }
    if (!Number.isInteger(quantityUsed) || quantityUsed < 1) {
      setError("La cantidad del repuesto debe ser un entero mayor que cero");
      return;
    }
    const existingQuantity = selectedParts.find((part) => part.inventoryItemId === inventoryItemId)?.quantityUsed ?? 0;
    if (existingQuantity + quantityUsed > Number(item.quantity)) {
      setError(`Solo hay ${item.quantity} unidades disponibles de ${item.name}`);
      return;
    }
    setSelectedParts((current) => {
      const existing = current.find((part) => part.inventoryItemId === inventoryItemId);
      if (!existing) return [...current, { inventoryItemId, quantityUsed }];
      return current.map((part) =>
        part.inventoryItemId === inventoryItemId
          ? { ...part, quantityUsed: part.quantityUsed + quantityUsed }
          : part
      );
    });
    setPartDraft((current) => ({ ...current, quantityUsed: 1 }));
    setError("");
  }

  async function handleClientSaved(client) {
    setAvailableClients((current) => [...current.filter((item) => item.id !== client.id), client]);
    setForm((current) => ({ ...current, clientId: client.id, deviceId: "" }));
    setClientModalOpen(false);
    await onClientCreated?.();
  }

  async function handleDeviceSaved(device) {
    setAvailableDevices((current) => [...current.filter((item) => item.id !== device.id), device]);
    setForm((current) => ({ ...current, clientId: device.clientId, deviceId: device.id }));
    setDeviceModalOpen(false);
    await onDeviceCreated?.();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateOrderForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        issue: form.issue.trim(),
        diagnosis: form.diagnosis.trim(),
        notes: form.notes.trim(),
        clientId: Number(form.clientId),
        deviceId: Number(form.deviceId),
        technicianId: form.technicianId ? Number(form.technicianId) : null,
        deliveryDate: form.deliveryDate || null,
        cost: Number(form.cost),
        ...(!initialData ? { partsUsed: selectedParts } : {}),
      };
      if (initialData) {
        await updateOrder(token, initialData.id, payload);
      } else {
        await createOrder(token, payload);
      }
      showToast(initialData ? "Orden actualizada correctamente" : "Orden registrada correctamente");
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormError message={error} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Código de orden">
            <TextInput value={form.code} onChange={(event) => update("code", event.target.value)} required />
          </Field>
          <Field label="Estado">
            <SelectInput value={form.status} onChange={(event) => update("status", event.target.value)}>
              {orderStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </SelectInput>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Cliente</span>
              <button
                type="button"
                onClick={() => setClientModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                <Plus className="h-4 w-4" />
                Nuevo cliente
              </button>
            </div>
            <SelectInput value={form.clientId} onChange={(event) => updateClient(event.target.value)} required>
              <option value="">Selecciona un cliente</option>
              {availableClients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </SelectInput>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Equipo</span>
              <button
                type="button"
                disabled={!form.clientId}
                onClick={() => setDeviceModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <Plus className="h-4 w-4" />
                Nuevo equipo
              </button>
            </div>
            <SelectInput value={form.deviceId} onChange={(event) => update("deviceId", event.target.value)} required>
              <option value="">Selecciona un equipo</option>
              {compatibleDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {[device.type, device.brand, device.model].filter(Boolean).join(" - ")}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>
        <Field label="Técnico asignado">
          <SelectInput value={form.technicianId} onChange={(event) => update("technicianId", event.target.value)}>
            <option value="">Sin asignar</option>
            {techniciansList.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </SelectInput>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Falla reportada">
            <TextAreaInput value={form.issue} onChange={(event) => update("issue", event.target.value)} />
          </Field>
          <Field label="Diagnóstico">
            <TextAreaInput value={form.diagnosis} onChange={(event) => update("diagnosis", event.target.value)} />
          </Field>
        </div>
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
        {!initialData ? (
          <section className="border-t border-line pt-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-ink">Repuestos utilizados</h4>
              <span className="text-sm font-semibold text-slate-600">{formatMoney(selectedPartsCost)}</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-end">
              <Field label="Repuesto">
                <SelectInput
                  value={partDraft.inventoryItemId}
                  onChange={(event) => setPartDraft((current) => ({ ...current, inventoryItemId: event.target.value }))}
                >
                  <option value="">Selecciona un repuesto</option>
                  {inventory.filter((item) => Number(item.quantity) > 0).map((item) => (
                    <option key={item.id} value={item.id}>{item.code} - {item.name} ({item.quantity})</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Cantidad">
                <TextInput
                  type="number"
                  min="1"
                  step="1"
                  value={partDraft.quantityUsed}
                  onChange={(event) => setPartDraft((current) => ({ ...current, quantityUsed: event.target.value }))}
                />
              </Field>
              <button
                type="button"
                onClick={addSelectedPart}
                className="inline-flex h-[42px] items-center justify-center gap-2 rounded border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-100"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
            {selectedParts.length ? (
              <div className="mt-4 divide-y divide-line rounded border border-line">
                {selectedParts.map((part) => {
                  const item = inventory.find((inventoryItem) => Number(inventoryItem.id) === Number(part.inventoryItemId));
                  return (
                    <div key={part.inventoryItemId} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-700">{item?.name ?? "Repuesto"}</p>
                        <p className="text-xs text-slate-500">{item?.code} · {part.quantityUsed} unidad(es) · {formatMoney(Number(item?.price ?? 0) * part.quantityUsed)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedParts((current) => current.filter((selected) => selected.inventoryItemId !== part.inventoryItemId))}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded text-rose-600 hover:bg-rose-50"
                        aria-label="Quitar repuesto"
                        title="Quitar repuesto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        ) : null}
        <Field label="Observaciones">
          <TextAreaInput value={form.notes} onChange={(event) => update("notes", event.target.value)} />
        </Field>
        <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
      <Modal title="Nuevo cliente" open={clientModalOpen} onClose={() => setClientModalOpen(false)}>
        <CreateClientForm token={token} onCancel={() => setClientModalOpen(false)} onSaved={handleClientSaved} />
      </Modal>
      <Modal title="Nuevo equipo" open={deviceModalOpen} onClose={() => setDeviceModalOpen(false)}>
        <CreateDeviceForm
          token={token}
          clients={availableClients}
          defaultClientId={form.clientId}
          onCancel={() => setDeviceModalOpen(false)}
          onSaved={handleDeviceSaved}
        />
      </Modal>
    </>
  );
}

function TechnicianOrderForm({ token, initialData, inventory, onPartsChanged, onSaved, onCancel }) {
  const formId = `technician-order-${initialData.id}`;
  const [form, setForm] = useState({
    status: initialData.status,
    diagnosis: initialData.diagnosis ?? "",
    deliveryDate: initialData.deliveryDate ?? "",
    cost: initialData.cost ?? 0,
    notes: initialData.notes ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.deliveryDate && form.deliveryDate < initialData.entryDate) {
      setError("La entrega no puede ser anterior al ingreso");
      return;
    }
    if (!Number.isFinite(Number(form.cost)) || Number(form.cost) < 0) {
      setError("El costo debe ser igual o mayor que cero");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await updateOrder(token, initialData.id, {
        ...form,
        diagnosis: form.diagnosis.trim(),
        notes: form.notes.trim(),
        deliveryDate: form.deliveryDate || null,
        cost: Number(form.cost),
      });
      showToast("Trabajo actualizado correctamente");
      await onSaved();
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <FormError message={error} />
        <Field label="Estado">
          <SelectInput value={form.status} onChange={(event) => update("status", event.target.value)}>
            {orderStatusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Diagnóstico">
          <TextAreaInput value={form.diagnosis} onChange={(event) => update("diagnosis", event.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha de entrega">
            <TextInput type="date" value={form.deliveryDate} onChange={(event) => update("deliveryDate", event.target.value)} />
          </Field>
          <Field label="Costo">
            <TextInput type="number" min="0" step="0.01" value={form.cost} onChange={(event) => update("cost", event.target.value)} />
          </Field>
        </div>
        <Field label="Notas técnicas">
          <TextAreaInput value={form.notes} onChange={(event) => update("notes", event.target.value)} />
        </Field>
      </form>
      <section className="border-t border-line pt-5">
        <p className="mb-4 text-sm text-slate-600">
          Los repuestos se guardan al asignarlos, independientemente de los cambios del formulario.
        </p>
        <OrderParts
          token={token}
          order={initialData}
          inventory={inventory}
          onChanged={onPartsChanged}
          canEdit
        />
      </section>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} formId={formId} />
    </div>
  );
}

function OrderWorkspace({ token, order, inventory, users, user, onEdit, onChanged }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [status, setStatus] = useState(order.status);
  const [technicianId, setTechnicianId] = useState(order.technicianId ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const techniciansList = users.filter((candidate) => candidate.role === "tecnico");
  const isAdmin = user?.role === "admin";
  const isAssignedToMe = Number(order.technicianId) === Number(user?.id);
  const canWork = isAdmin || isAssignedToMe;

  async function saveAssignment() {
    setIsSaving(true);
    setError("");
    try {
      const payload = isAdmin
        ? { status, technicianId: technicianId ? Number(technicianId) : null }
        : { status };
      await updateOrder(token, order.id, payload);
      await onChanged();
      showToast("Orden actualizada correctamente");
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClaim() {
    setIsSaving(true);
    setError("");
    try {
      await claimOrder(token, order.id);
      await onChanged();
      showToast("La orden fue asignada a tu usuario");
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setIsSaving(false);
    }
  }

  const tabs = [
    ["summary", "Resumen"],
    ["parts", `Repuestos (${order.partsUsed?.length ?? 0})`],
    ["history", `Historial (${order.history?.length ?? 0})`],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xl font-semibold text-ink">{order.code}</p>
            <Badge label={order.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {order.client?.name ?? "Sin cliente"} · {order.device?.brand} {order.device?.model}
          </p>
        </div>
        {canWork ? (
          <div className={`grid gap-3 ${isAdmin ? "sm:grid-cols-[minmax(170px,1fr)_minmax(170px,1fr)_auto]" : "sm:grid-cols-[minmax(190px,1fr)_auto]"}`}>
            <SelectInput value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Estado de la orden">
              {orderStatusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </SelectInput>
            {isAdmin ? (
              <SelectInput
                value={technicianId}
                onChange={(event) => setTechnicianId(event.target.value)}
                aria-label="Técnico asignado"
              >
                <option value="">Sin asignar</option>
                {techniciansList.map((technician) => (
                  <option key={technician.id} value={technician.id}>{technician.name}</option>
                ))}
              </SelectInput>
            ) : null}
            <button
              type="button"
              onClick={saveAssignment}
              disabled={isSaving}
              className="mt-2 rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-slate-400"
            >
              {isSaving ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClaim}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-slate-400"
          >
            <Wrench className="h-4 w-4" />
            {isSaving ? "Asignando..." : "Asignarme esta orden"}
          </button>
        )}
      </div>

      <FormError message={error} />

      <div className="inline-flex max-w-full overflow-x-auto rounded border border-line bg-slate-50 p-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap rounded px-4 py-2 text-sm font-semibold transition ${
              activeTab === id ? "bg-white text-brand-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "summary" && (
        <OrderSummary
          order={order}
          onEdit={onEdit}
          canEdit={canWork}
          editLabel={isAdmin ? "Editar datos completos" : "Actualizar trabajo"}
        />
      )}
      {activeTab === "parts" && (
        <OrderParts token={token} order={order} inventory={inventory} onChanged={onChanged} canEdit={canWork} />
      )}
      {activeTab === "history" && (
        <OrderHistory token={token} order={order} onChanged={onChanged} canAdd={canWork} />
      )}
    </div>
  );
}

function OrderSummary({ order, onEdit, canEdit, editLabel }) {
  return (
    <div className="space-y-5">
      {canEdit ? <div className="flex justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          {editLabel}
        </button>
      </div> : null}
      <DetailGrid
        items={[
          { label: "Cliente", value: order.client?.name },
          {
            label: "Equipo",
            value: [order.device?.type, order.device?.brand, order.device?.model].filter(Boolean).join(" - "),
          },
          { label: "Técnico", value: order.technician?.name ?? "Sin asignar" },
          { label: "Costo", value: formatMoney(order.cost) },
          { label: "Ingreso", value: formatDate(order.entryDate) },
          { label: "Entrega", value: formatDate(order.deliveryDate) },
          { label: "Falla reportada", value: order.issue, wide: true },
          { label: "Diagnóstico", value: order.diagnosis, wide: true },
          { label: "Notas", value: order.notes, wide: true },
        ]}
      />
    </div>
  );
}

function OrderParts({ token, order, inventory, onChanged, canEdit }) {
  const availableItems = inventory.filter((item) => Number(item.quantity) > 0);
  const [inventoryItemId, setInventoryItemId] = useState(availableItems[0]?.id ?? "");
  const [quantityUsed, setQuantityUsed] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const selectedItem = inventory.find((item) => Number(item.id) === Number(inventoryItemId));
  const partsTotal = (order.partsUsed ?? []).reduce(
    (total, part) => total + Number(part.inventoryItem?.price ?? 0) * Number(part.quantityUsed ?? 0),
    0
  );

  useEffect(() => {
    if (!availableItems.some((item) => Number(item.id) === Number(inventoryItemId))) {
      setInventoryItemId(availableItems[0]?.id ?? "");
    }
  }, [inventory, inventoryItemId]);

  async function handleAdd(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await addOrderPart(token, order.id, {
        inventoryItemId: Number(inventoryItemId),
        quantityUsed: Number(quantityUsed),
      });
      setQuantityUsed(1);
      await onChanged();
      showToast("Repuesto asignado correctamente");
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(partId) {
    setRemovingId(partId);
    setError("");
    try {
      await removeOrderPart(token, order.id, partId);
      await onChanged();
      showToast("Repuesto devuelto al inventario");
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className={canEdit ? "grid gap-6 lg:grid-cols-[1.35fr_0.8fr]" : ""}>
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="font-semibold text-ink">Repuestos utilizados</h4>
          <span className="text-sm font-semibold text-slate-600">{formatMoney(partsTotal)}</span>
        </div>
        {order.partsUsed?.length ? (
          <div className="divide-y divide-line border-y border-line">
            {order.partsUsed.map((part) => (
              <div key={part.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{part.inventoryItem?.name ?? "Repuesto"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {part.inventoryItem?.code} · {part.quantityUsed} unidad(es) · {formatMoney(part.inventoryItem?.price)} c/u
                  </p>
                </div>
                {canEdit ? (
                  <ActionIconButton
                    label="Retirar repuesto"
                    danger
                    disabled={Boolean(removingId)}
                    onClick={() => handleRemove(part.id)}
                  >
                    {removingId === part.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </ActionIconButton>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin repuestos asignados" description="Agrega los componentes utilizados en la reparación." />
        )}
      </div>

      {canEdit ? <form className="space-y-4 border-l-0 border-line lg:border-l lg:pl-6" onSubmit={handleAdd}>
        <h4 className="font-semibold text-ink">Asignar repuesto</h4>
        <FormError message={error} />
        {availableItems.length ? (
          <>
            <Field label="Repuesto">
              <SelectInput value={inventoryItemId} onChange={(event) => setInventoryItemId(event.target.value)} required>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label={`Cantidad disponible: ${selectedItem?.quantity ?? 0}`}>
              <TextInput
                type="number"
                min="1"
                max={selectedItem?.quantity ?? 1}
                value={quantityUsed}
                onChange={(event) => setQuantityUsed(event.target.value)}
                required
              />
            </Field>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-slate-400"
            >
              {isSubmitting ? "Asignando..." : "Asignar al trabajo"}
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">No hay repuestos con existencias disponibles.</p>
        )}
      </form> : null}
    </div>
  );
}

function OrderHistory({ token, order, onChanged, canAdd }) {
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await addOrderObservation(token, order.id, detail);
      setDetail("");
      await onChanged();
      showToast("Observación agregada al historial");
    } catch (nextError) {
      setError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={canAdd ? "grid gap-6 lg:grid-cols-[1.25fr_0.8fr]" : ""}>
      <div>
        <h4 className="mb-4 font-semibold text-ink">Linea de tiempo</h4>
        {order.history?.length ? (
          <div className="space-y-0">
            {order.history.map((event, index) => (
              <div key={event.id} className="relative flex gap-4 pb-5">
                {index < order.history.length - 1 && (
                  <span className="absolute left-[17px] top-9 h-[calc(100%-1.5rem)] w-px bg-line" />
                )}
                <div className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded bg-brand-50 text-brand-700">
                  <History className="h-4 w-4" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-slate-800">{event.event}</p>
                  <p className="mt-1 text-sm text-slate-600">{event.detail ?? "-"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {event.author?.name ?? "Sistema"} · {formatDateTime(event.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin eventos" description="Los cambios de esta orden aparecerán aquí." />
        )}
      </div>

      {canAdd ? <form className="space-y-4 border-l-0 border-line lg:border-l lg:pl-6" onSubmit={handleSubmit}>
        <h4 className="font-semibold text-ink">Nueva observación técnica</h4>
        <FormError message={error} />
        <Field label="Detalle">
          <TextAreaInput
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="Registra hallazgos, pruebas realizadas o acuerdos con el cliente"
            required
          />
        </Field>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-slate-400"
        >
          {isSubmitting ? "Registrando..." : "Agregar al historial"}
        </button>
      </form> : null}
    </div>
  );
}

function InventoryLive({ token, user }) {
  const { data = [], isLoading, error, reload } = useApiData(getInventory, token);
  const [modalOpen, setModalOpen] = useState(false);
  const crud = useCrudActions(token, deleteInventoryItem, reload);
  const isAdmin = user?.role === "admin";
  const items = data ?? [];
  const lowStockCount = items.filter((item) => item.status === "Stock bajo").length;
  const totalValue = items.reduce((total, item) => total + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0);

  return (
    <SectionShell
      buttonLabel={isAdmin ? "Nuevo repuesto" : null}
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
          columns={[
            "Código",
            "Nombre",
            "Categoría",
            "Cantidad",
            "Stock minimo",
            "Precio",
            "Ubicación",
            "Estado",
            ...(isAdmin ? ["Acciones"] : []),
          ]}
          rows={items.map((item) => [
            item.code,
            item.name,
            item.category ?? "-",
            item.quantity,
            item.minStock,
            formatMoney(item.price),
            item.location ?? "-",
            <Badge key={item.id ?? item.code} label={item.status} />,
            ...(isAdmin
              ? [
                  <CrudActions
                    key={`actions-${item.id}`}
                    onView={() => crud.setViewing(item)}
                    onEdit={() => crud.setEditing(item)}
                    onDelete={() => crud.requestDelete(item)}
                  />,
                ]
              : []),
          ])}
          emptyTitle="Inventario sin repuestos"
          emptyDescription="Aún no hay repuestos registrados en la base de datos."
          searchPlaceholder="Buscar por código, repuesto o ubicación"
          filters={[{ label: "Categoría", column: 2 }, { label: "Estado", column: 7 }]}
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
              { label: "Código", value: crud.viewing.code },
              { label: "Nombre", value: crud.viewing.name },
              { label: "Categoría", value: crud.viewing.category },
              { label: "Ubicación", value: crud.viewing.location },
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

function OrdersLive({ token, user }) {
  const isAdmin = user?.role === "admin";
  const { data = [], isLoading, error, reload } = useApiData(getOrders, token);
  const { data: clientsData = [], reload: reloadClients } = useApiData(getClients, token, isAdmin);
  const { data: devicesData = [], reload: reloadDevices } = useApiData(getDevices, token, isAdmin);
  const { data: usersData = [] } = useApiData(getUsers, token, isAdmin);
  const { data: inventoryData = [], reload: reloadInventory } = useApiData(getInventory, token);
  const [modalOpen, setModalOpen] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const crud = useCrudActions(token, deleteOrder, reload);
  const items = data ?? [];
  const clientsList = clientsData ?? [];
  const devicesList = devicesData ?? [];
  const usersList = usersData ?? [];
  const inventoryList = inventoryData ?? [];
  const pending = items.filter((order) => order.status === "Pendiente").length;
  const inRepair = items.filter((order) => order.status === orderStatusOptions[2]).length;
  const finished = items.filter((order) => ["Finalizado", "Entregado"].includes(order.status)).length;
  const assignedToMe = items.filter((order) => Number(order.technicianId) === Number(user?.id)).length;
  const available = items.filter((order) => order.technicianId === null).length;

  async function openWorkspace(order) {
    crud.setViewing(order);
    try {
      const updated = await getOrder(token, order.id);
      crud.setViewing(updated);
    } catch {
      // Keep the list data visible if the detail refresh fails.
    }
  }

  async function refreshWorkspace() {
    if (!crud.viewing) return;
    const [updated] = await Promise.all([
      getOrder(token, crud.viewing.id),
      reload(),
      reloadInventory(),
    ]);
    crud.setViewing(updated);
  }

  async function refreshEditedOrder() {
    if (!crud.editing) return;
    const [updated] = await Promise.all([
      getOrder(token, crud.editing.id),
      reload(),
      reloadInventory(),
    ]);
    crud.setEditing(updated);
  }

  async function handleClaim(order) {
    setClaimingId(order.id);
    setActionError("");
    try {
      await claimOrder(token, order.id);
      await reload();
      showToast("La orden fue asignada a tu usuario");
    } catch (nextError) {
      setActionError(nextError.message);
      showToast(nextError.message, "error");
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <SectionShell
      buttonLabel={isAdmin ? "Nueva orden" : null}
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={isAdmin
        ? [["Pendientes", pending], ["En reparación", inRepair], ["Finalizadas", finished]]
        : [["Mis órdenes", assignedToMe], ["Disponibles", available], ["En reparación", inRepair]]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <FormError message={actionError} />
      <Panel title="Ordenes activas">
        <LiveTable
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
            <OrderRowActions
              key={`actions-${order.id}`}
              isAdmin={isAdmin}
              isAssigned={Number(order.technicianId) === Number(user?.id)}
              isAvailable={order.technicianId === null}
              isClaiming={claimingId === order.id}
              onView={() => openWorkspace(order)}
              onEdit={() => crud.setEditing(order)}
              onDelete={() => crud.requestDelete(order)}
              onClaim={() => handleClaim(order)}
            />,
          ])}
          emptyTitle="Sin órdenes de reparación"
          emptyDescription="Cuando se registre la primera orden, aparecerá en esta tabla."
          searchPlaceholder="Buscar por orden, cliente, equipo o técnico"
          filters={[{ label: "Técnico", column: 5 }, { label: "Estado", column: 7 }]}
        />
      </Panel>
      <Modal title="Nueva orden de reparación" open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <CreateOrderForm
          token={token}
          clients={clientsList}
          devices={devicesList}
          users={usersList}
          inventory={inventoryList}
          onClientCreated={reloadClients}
          onDeviceCreated={reloadDevices}
          onCancel={() => setModalOpen(false)}
          onSaved={async () => {
            await Promise.all([reload(), reloadInventory()]);
            setModalOpen(false);
          }}
        />
      </Modal>
      <Modal
        title="Gestión de la orden"
        open={Boolean(crud.viewing)}
        onClose={() => crud.setViewing(null)}
        size="lg"
      >
        {crud.viewing && (
          <OrderWorkspace
            token={token}
            order={crud.viewing}
            inventory={inventoryList}
            users={usersList}
            user={user}
            onChanged={refreshWorkspace}
            onEdit={() => {
              crud.setEditing(crud.viewing);
              crud.setViewing(null);
            }}
          />
        )}
      </Modal>
      <Modal title="Editar orden de reparación" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)} size="lg">
        {crud.editing && (
          isAdmin ? (
            <CreateOrderForm
              token={token}
              clients={clientsList}
              devices={devicesList}
              users={usersList}
              inventory={inventoryList}
              initialData={crud.editing}
              onClientCreated={reloadClients}
              onDeviceCreated={reloadDevices}
              onCancel={() => crud.setEditing(null)}
              onSaved={async () => {
                await reload();
                crud.setEditing(null);
              }}
            />
          ) : (
            <TechnicianOrderForm
              token={token}
              initialData={crud.editing}
              inventory={inventoryList}
              onPartsChanged={refreshEditedOrder}
              onCancel={() => crud.setEditing(null)}
              onSaved={async () => {
                await reload();
                crud.setEditing(null);
              }}
            />
          )
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
          columns={["Nombre", "Teléfono", "Correo", "Tipo", "Registrado", "Acciones"]}
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
          emptyDescription="Aún no hay clientes registrados en la base de datos."
          searchPlaceholder="Buscar por nombre, teléfono o correo"
          filters={[{ label: "Tipo", column: 3 }]}
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
              { label: "Teléfono", value: crud.viewing.phone },
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
      <Panel title="Equipos electrónicos">
        <LiveTable
          columns={["Tipo", "Marca", "Modelo", "Propietario", "Condición", "Estado", "Acciones"]}
          rows={items.map((device) => [
            device.type,
            device.brand || "-",
            device.model || "-",
            device.owner?.name ?? "Sin propietario",
            device.condition ?? "-",
            <Badge key={device.id} label={device.status} />,
            <CrudActions
              key={`actions-${device.id}`}
              onView={() => crud.setViewing(device)}
              onEdit={() => crud.setEditing(device)}
              onDelete={() => crud.requestDelete(device)}
            />,
          ])}
          emptyTitle="Sin equipos"
          emptyDescription="Los equipos registrados desde recepción aparecerán aquí."
          searchPlaceholder="Buscar por tipo, marca, modelo o propietario"
          filters={[{ label: "Tipo", column: 0 }, { label: "Estado", column: 5 }]}
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
              { label: "Tipo", value: crud.viewing.type },
              { label: "Marca", value: crud.viewing.brand },
              { label: "Modelo", value: crud.viewing.model },
              { label: "Propietario", value: crud.viewing.owner?.name },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
              { label: "Condición de ingreso", value: crud.viewing.condition, wide: true },
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const filteredTechnicians = techniciansList.filter((technician) => {
    const matchesQuery = normalizeSearchText(`${technician.name} ${technician.email} ${technician.phone ?? ""}`).includes(normalizeSearchText(query));
    return matchesQuery && (!statusFilter || technician.status === statusFilter);
  });
  const totalPages = Math.max(1, Math.ceil(filteredTechnicians.length / 8));
  const currentPage = Math.min(page, totalPages);
  const visibleTechnicians = filteredTechnicians.slice((currentPage - 1) * 8, currentPage * 8);

  useEffect(() => setPage(1), [query, statusFilter, techniciansList.length]);

  return (
    <SectionShell
      buttonLabel="Nuevo técnico"
      icon={Plus}
      onAction={() => setModalOpen(true)}
      summary={[
        ["Técnicos", techniciansList.length],
        ["Disponibles", techniciansList.filter((user) => user.status === "Disponible").length],
        ["Ocupados", techniciansList.filter((user) => user.status === "Ocupada").length],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      {techniciansList.length ? (
        <>
        <CollectionToolbar
          query={query}
          onQueryChange={setQuery}
          placeholder="Buscar técnico por nombre, correo o teléfono"
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="Estado"
          options={["Disponible", "Ocupada"]}
        />
        {visibleTechnicians.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleTechnicians.map((tech) => (
            <article key={tech.id} className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded bg-teal-50 text-teal-700">
                  <Wrench className="h-5 w-5" />
                </div>
                <Badge label={tech.status} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{tech.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{tech.email}</p>
              <p className="mt-1 text-sm text-slate-500">{tech.phone || "Sin teléfono"}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Último acceso
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
          <EmptyState title="Sin coincidencias" description="Prueba con otra búsqueda o estado." />
        )}
        <PaginationFooter
          total={techniciansList.length}
          visible={filteredTechnicians.length}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        </>
      ) : (
        <EmptyState title="Sin técnicos" description="Aún no hay usuarios técnicos registrados." />
      )}
      <Modal title="Nuevo técnico" open={modalOpen} onClose={() => setModalOpen(false)}>
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
      <Modal title="Detalle del técnico" open={Boolean(crud.viewing)} onClose={() => crud.setViewing(null)}>
        {crud.viewing && (
          <DetailGrid
            items={[
              { label: "Nombre", value: crud.viewing.name },
              { label: "Correo", value: crud.viewing.email },
              { label: "Teléfono", value: crud.viewing.phone || "-" },
              { label: "Rol", value: getRoleLabel(crud.viewing.role) },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
              { label: "Último acceso", value: formatDate(crud.viewing.lastAccess) },
              { label: "Registrado", value: formatDate(crud.viewing.createdAt) },
            ]}
          />
        )}
      </Modal>
      <Modal title="Editar técnico" open={Boolean(crud.editing)} onClose={() => crud.setEditing(null)}>
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
  const { data: ordersData = [], isLoading: ordersLoading, error: ordersError } = useApiData(getOrders, token);
  const items = data ?? [];
  const completedOrders = getCompletedOrders(ordersData ?? []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [page, setPage] = useState(1);
  const filteredItems = items.filter((item) => {
    const searchable = `${item.event} ${item.detail ?? ""} ${item.order?.code ?? ""} ${item.author?.name ?? ""}`;
    return normalizeSearchText(searchable).includes(normalizeSearchText(query)) && (!eventFilter || item.event === eventFilter);
  });
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / 8));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice((currentPage - 1) * 8, currentPage * 8);

  useEffect(() => setPage(1), [query, eventFilter, items.length]);

  return (
    <SectionShell
      summary={[
        ["Finalizadas", completedOrders.filter((order) => order.status === "Finalizado").length],
        ["Entregadas", completedOrders.filter((order) => order.status === "Entregado").length],
        ["Eventos", items.length],
      ]}
    >
      <ModuleState isLoading={ordersLoading} error={ordersError} />
      <Panel title="Órdenes finalizadas y entregadas">
        <LiveTable
          columns={["Orden", "Cliente", "Equipo", "Técnico", "Estado", "Última actualización", "Acciones"]}
          rows={completedOrders.map((order) => [
            order.code,
            order.client?.name ?? "Sin cliente",
            [order.device?.brand, order.device?.model].filter(Boolean).join(" ") || "Sin equipo",
            order.technician?.name ?? "Sin asignar",
            <Badge key={`status-${order.id}`} label={order.status} />,
            formatDateTime(order.updatedAt),
            <ActionIconButton key={`view-${order.id}`} label="Ver orden" onClick={() => setSelectedOrder(order)}>
              <Eye className="h-4 w-4" />
            </ActionIconButton>,
          ])}
          emptyTitle="Sin órdenes finalizadas o entregadas"
          emptyDescription="Aparecerán aquí cuando un técnico cambie su estado."
          searchPlaceholder="Buscar por orden, cliente, equipo o técnico"
          filters={[{ label: "Estado", column: 4 }]}
        />
      </Panel>
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Trazabilidad de mantenimiento">
        <CollectionToolbar
          query={query}
          onQueryChange={setQuery}
          placeholder="Buscar por evento, orden o responsable"
          filterValue={eventFilter}
          onFilterChange={setEventFilter}
          filterLabel="Evento"
          options={[...new Set(items.map((item) => item.event))].sort()}
        />
        {items.length ? (
          visibleItems.length ? <div className="space-y-4">
            {visibleItems.map((item) => (
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
          </div> : <EmptyState title="Sin coincidencias" description="Prueba con otra búsqueda o tipo de evento." />
        ) : (
          <EmptyState title="Sin historial" description="Las acciones de mantenimiento aparecerán en esta vista." />
        )}
        <PaginationFooter
          total={items.length}
          visible={filteredItems.length}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Panel>
      <Modal
        title={selectedOrder ? `Orden ${selectedOrder.code}` : "Orden"}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <Badge label={selectedOrder.status} />
            <OrderSummary order={selectedOrder} canEdit={false} />
            <OrderHistory order={selectedOrder} canAdd={false} />
          </div>
        )}
      </Modal>
    </SectionShell>
  );
}

function ReportsLive({ token }) {
  const emptyFilters = { from: "", to: "", technicianId: "", status: "" };
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const reportLoader = useMemo(() => (authToken) => getReports(authToken, appliedFilters), [appliedFilters]);
  const { data, isLoading, error } = useApiData(reportLoader, token);
  const { data: users = [] } = useApiData(getUsers, token);
  const technicians = (users ?? []).filter((user) => user.role === "tecnico");
  const byMonth = data?.byMonth ?? [];
  const byStatus = data?.byStatus ?? [];
  const byTechnician = data?.byTechnician ?? [];
  const mostUsedParts = data?.mostUsedParts ?? [];
  const lowStock = data?.lowStock ?? [];
  const indicators = data?.indicators ?? {};
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const selectedTechnician = technicians.find((technician) => String(technician.id) === String(appliedFilters.technicianId));
  const filterLabels = {
    from: appliedFilters.from || "Sin límite",
    to: appliedFilters.to || "Sin límite",
    technician: selectedTechnician?.name || "Todos",
    status: appliedFilters.status || "Todos",
  };

  function updateFilter(field, value) {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    if (draftFilters.from && draftFilters.to && draftFilters.from > draftFilters.to) {
      showToast("La fecha final debe ser igual o posterior a la fecha inicial", "error");
      return;
    }
    setAppliedFilters({ ...draftFilters });
    showToast("Filtros aplicados correctamente");
  }

  function clearFilters() {
    setDraftFilters({ ...emptyFilters });
    setAppliedFilters({ ...emptyFilters });
    showToast("Filtros restablecidos");
  }

  function handlePdfExport() {
    exportReportPdf(data, filterLabels);
    showToast("Reporte PDF generado correctamente");
  }

  function handleExcelExport() {
    exportReportExcel(data, filterLabels);
    showToast("Reporte de Excel generado correctamente");
  }

  return (
    <SectionShell
      summary={[
        ["Reparaciones", indicators.totalOrders ?? 0],
        ["Finalizadas", indicators.completedOrders ?? 0],
        ["Ingresos estimados", formatMoney(indicators.estimatedIncome)],
        ["Costo de repuestos", formatMoney(indicators.partsCost)],
        ["Utilidad estimada", formatMoney(indicators.estimatedProfit)],
        ["Ticket promedio", formatMoney(indicators.averageTicket)],
      ]}
    >
      <Panel
        title="Filtros del reporte"
        action={<span className="text-sm text-slate-500">{activeFilterCount ? `${activeFilterCount} activos` : "Sin filtros"}</span>}
      >
        <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Desde">
            <TextInput type="date" value={draftFilters.from} onChange={(event) => updateFilter("from", event.target.value)} />
          </Field>
          <Field label="Hasta">
            <TextInput type="date" value={draftFilters.to} onChange={(event) => updateFilter("to", event.target.value)} />
          </Field>
          <Field label="Técnico">
            <SelectInput value={draftFilters.technicianId} onChange={(event) => updateFilter("technicianId", event.target.value)}>
              <option value="">Todos los técnicos</option>
              {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Estado">
            <SelectInput value={draftFilters.status} onChange={(event) => updateFilter("status", event.target.value)}>
              <option value="">Todos los estados</option>
              {orderStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </SelectInput>
          </Field>
          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-4 xl:justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded border border-line px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Aplicar filtros
            </button>
          </div>
        </form>
      </Panel>
      <ModuleState isLoading={isLoading} error={error} />
      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          disabled={!data || isLoading}
          onClick={handlePdfExport}
          className="inline-flex items-center justify-center gap-2 rounded border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </button>
        <button
          type="button"
          disabled={!data || isLoading}
          onClick={handleExcelExport}
          className="inline-flex items-center justify-center gap-2 rounded bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ReportPanel title="Reparaciones por mes" rows={byMonth} labelKey="month" valueKey="total" barClassName="bg-brand-500" />
        <ReportPanel title="Órdenes por estado" rows={byStatus} labelKey="status" valueKey="total" barClassName="bg-amber-500" />
        <ReportPanel title="Reparaciones por técnico" rows={byTechnician} labelKey="name" valueKey="total" barClassName="bg-teal-500" />
        <ReportPanel title="Repuestos más usados" rows={mostUsedParts} labelKey="name" valueKey="totalUsed" barClassName="bg-emerald-500" />
      </div>
      <Panel title={`Alertas de stock bajo (${lowStock.length})`}>
        {lowStock.length ? (
          <ResponsiveTable
            columns={["Código", "Repuesto", "Existencia", "Mínimo"]}
            rows={lowStock.map((item) => [item.code, item.name, item.quantity, item.minStock])}
          />
        ) : (
          <EmptyState title="Inventario saludable" description="No hay repuestos por debajo del stock mínimo." />
        )}
      </Panel>
    </SectionShell>
  );
}

function ReportPanel({ title, rows, labelKey, valueKey, barClassName = "bg-brand-500" }) {
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
                  <div className={`h-full rounded ${barClassName}`} style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Sin datos para reporte" description="Este reporte se llenará cuando existan operaciones." />
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
        ["Técnicos", items.filter((user) => user.role === "tecnico").length],
        ["Usuarios", items.length],
      ]}
    >
      <ModuleState isLoading={isLoading} error={error} />
      <Panel title="Usuarios del sistema">
        <LiveTable
          columns={["Usuario", "Correo", "Teléfono", "Rol", "Estado", "Último acceso", "Acciones"]}
          rows={items.map((user) => [
            user.name,
            user.email,
            user.phone || "-",
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
          searchPlaceholder="Buscar por nombre, correo o teléfono"
          filters={[{ label: "Rol", column: 3 }, { label: "Estado", column: 4 }]}
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
              { label: "Teléfono", value: crud.viewing.phone || "-" },
              { label: "Rol", value: getRoleLabel(crud.viewing.role) },
              { label: "Estado", value: <Badge label={crud.viewing.status} /> },
              { label: "Último acceso", value: formatDate(crud.viewing.lastAccess) },
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
        {buttonLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Icon className="h-4 w-4" />
            {buttonLabel}
          </button>
        ) : null}
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
