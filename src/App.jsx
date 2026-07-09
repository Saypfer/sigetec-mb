import { useMemo, useState } from "react";
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
  Laptop,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentModule = moduleTitles[activeModule] ?? moduleTitles.dashboard;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
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
      />
      <div className="lg:pl-72">
        <Topbar
          title={currentModule.title}
          subtitle={currentModule.subtitle}
          onMenu={() => setSidebarOpen(true)}
          onLogout={() => setIsAuthenticated(false)}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ModuleRenderer activeModule={activeModule} />
        </main>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
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
              onSubmit={(event) => {
                event.preventDefault();
                onLogin();
              }}
            >
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Correo</span>
                <input
                  type="email"
                  defaultValue="admin@tallermb.gt"
                  className="mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Contraseña</span>
                <input
                  type="password"
                  defaultValue="sigetecmb"
                  className="mt-2 w-full rounded border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </label>
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
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
              >
                <LogIn className="h-4 w-4" />
                Entrar al sistema
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar({ activeModule, onSelect, open, onClose }) {
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
                <p className="truncate text-sm font-semibold">Admin MB</p>
                <p className="truncate text-xs text-slate-500">Administrador</p>
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

function ModuleRenderer({ activeModule }) {
  const modules = {
    dashboard: <Dashboard />,
    inventory: <Inventory />,
    orders: <Orders />,
    clients: <Clients />,
    devices: <Devices />,
    technicians: <Technicians />,
    history: <MaintenanceHistory />,
    reports: <Reports />,
    users: <UsersModule />,
    settings: <SettingsModule />,
  };

  return modules[activeModule] ?? <Dashboard />;
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

function SectionShell({ children, buttonLabel, icon: Icon, summary }) {
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
        <button className="inline-flex items-center justify-center gap-2 rounded bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
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
