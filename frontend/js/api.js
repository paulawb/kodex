import { API_URL } from "./config.js";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const d = (await res.json()).detail;
      msg = typeof d === "string" ? d : JSON.stringify(d);
    } catch {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

async function upload(token, file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(API_URL + "/api/admin/upload", { method: "POST", body: fd, headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.detail || res.statusText); e.status = res.status; throw e; }
  return data.url;
}

export const api = {
  upload,
  products: () => request("/api/products"),
  settings: () => request("/api/settings"),
  login: (password) => request("/api/admin/login", { method: "POST", body: { password } }),
  adminProducts: (t) => request("/api/admin/products", { token: t }),
  createProduct: (t, b) => request("/api/admin/products", { method: "POST", body: b, token: t }),
  updateProduct: (t, id, b) => request(`/api/admin/products/${id}`, { method: "PUT", body: b, token: t }),
  deleteProduct: (t, id) => request(`/api/admin/products/${id}`, { method: "DELETE", token: t }),
  updateSettings: (t, b) => request("/api/admin/settings", { method: "PUT", body: b, token: t }),
};
