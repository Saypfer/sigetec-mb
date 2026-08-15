const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "http://127.0.0.1:4000/api";

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
    const fieldMessage = Object.values(data.errors ?? {})[0];
    const message = data.message || "No se pudo completar la solicitud";
    const error = new Error(fieldMessage ? `${message}: ${fieldMessage}` : message);
    error.status = response.status;
    error.fields = data.errors ?? {};
    throw error;
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

export function getOrder(token, id) {
  return request(`/orders/${id}`, { token });
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

export function claimOrder(token, id) {
  return request(`/orders/${id}/claim`, {
    token,
    method: "POST",
  });
}

export function deleteOrder(token, id) {
  return request(`/orders/${id}`, { token, method: "DELETE" });
}

export function addOrderPart(token, orderId, payload) {
  return request(`/orders/${orderId}/parts`, {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function removeOrderPart(token, orderId, partId) {
  return request(`/orders/${orderId}/parts/${partId}`, {
    token,
    method: "DELETE",
  });
}

export function addOrderObservation(token, orderId, detail) {
  return request(`/orders/${orderId}/observations`, {
    token,
    method: "POST",
    body: JSON.stringify({ detail }),
  });
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

export function getReports(token, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return request(`/reports/summary${query ? `?${query}` : ""}`, { token });
}
