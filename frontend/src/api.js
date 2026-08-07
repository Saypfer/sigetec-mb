const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api";

async function request(path, options = {}) {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la solicitud");
  }

  return data;
}

export function loginUser(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getDashboard(token) {
  return request("/dashboard", { token });
}

export function getInventory(token) {
  return request("/inventory", { token });
}

export function createInventoryItem(token, payload) {
  return request("/inventory", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateInventoryItem(token, id, payload) {
  return request(`/inventory/${id}`, {
    token,
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteInventoryItem(token, id) {
  return request(`/inventory/${id}`, { token, method: "DELETE" });
}

export function getOrders(token) {
  return request("/orders", { token });
}

export function createOrder(token, payload) {
  return request("/orders", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateOrder(token, id, payload) {
  return request(`/orders/${id}`, {
    token,
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteOrder(token, id) {
  return request(`/orders/${id}`, { token, method: "DELETE" });
}

export function getClients(token) {
  return request("/clients", { token });
}

export function createClient(token, payload) {
  return request("/clients", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateClient(token, id, payload) {
  return request(`/clients/${id}`, {
    token,
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteClient(token, id) {
  return request(`/clients/${id}`, { token, method: "DELETE" });
}

export function getDevices(token) {
  return request("/devices", { token });
}

export function createDevice(token, payload) {
  return request("/devices", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDevice(token, id, payload) {
  return request(`/devices/${id}`, {
    token,
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDevice(token, id) {
  return request(`/devices/${id}`, { token, method: "DELETE" });
}

export function getUsers(token) {
  return request("/users", { token });
}

export function createUser(token, payload) {
  return request("/users", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(token, id, payload) {
  return request(`/users/${id}`, {
    token,
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(token, id) {
  return request(`/users/${id}`, { token, method: "DELETE" });
}

export function getHistory(token) {
  return request("/history", { token });
}

export async function getReports(token) {
  const [byMonth, byStatus, byTechnician, mostUsedParts, lowStock, estimatedIncome] =
    await Promise.all([
      request("/reports/by-month", { token }),
      request("/reports/by-status", { token }),
      request("/reports/by-technician", { token }),
      request("/reports/most-used-parts", { token }),
      request("/reports/low-stock", { token }),
      request("/reports/estimated-income", { token }),
    ]);

  return { byMonth, byStatus, byTechnician, mostUsedParts, lowStock, estimatedIncome };
}
