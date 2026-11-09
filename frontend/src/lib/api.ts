const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Validación ligera de la contraseña del admin. */
export async function adminPing(password: string, timeoutMs = 90000): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/admin/ping`,
      { headers: { "x-admin-password": password }, cache: "no-store" },
      timeoutMs
    );
    if (res.status === 401) return false;
    if (!res.ok) throw new Error("Error del servidor");
    return true;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("El servidor tardó demasiado en responder. Intenta de nuevo.");
    }
    throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
  }
}

async function errorMessage(res: Response, fallback: string) {
  try {
    const text = await res.text();
    if (!text) return fallback;
    try {
      const json = JSON.parse(text);
      const msg = json?.message;
      if (Array.isArray(msg)) return msg.join(", ");
      if (typeof msg === "string" && msg) return msg;
      return text;
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
}

export async function getProducts(options: { fresh?: boolean } = {}) {
  // Cache corto en el navegador para la tienda; "fresh" fuerza datos nuevos
  // (lo usa el carrito para reflejar cambios de fotos y stock al instante).
  const res = await fetch(`${API_URL}/products`, options.fresh ? { cache: "no-store" } : undefined);
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}

export async function getFeaturedProducts() {
  const res = await fetch(`${API_URL}/products/featured`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener productos destacados");
  return res.json();
}

export async function getProductBySlug(slug: string) {
  const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener producto");
  return res.json();
}

export interface SiteSettings {
  banner: string | null;
  lookbook1: string | null;
  lookbook2: string | null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_URL}/settings`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener la apariencia");
  return res.json();
}

export async function adminGetSiteSettings(password: string): Promise<SiteSettings> {
  const res = await fetch(`${API_URL}/admin/settings`, {
    headers: { "x-admin-password": password },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

export async function adminUpdateSiteSettings(password: string, data: Partial<SiteSettings>) {
  const res = await fetch(`${API_URL}/admin/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Error al guardar la apariencia"));
  }
  return res.json();
}

export async function adminGetProducts(password: string) {
  const res = await fetch(`${API_URL}/admin/products`, {
    headers: { "x-admin-password": password },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

export async function adminGetProduct(password: string, id: string) {
  const res = await fetchWithTimeout(
    `${API_URL}/admin/products/${id}`,
    { headers: { "x-admin-password": password }, cache: "no-store" },
    60000
  );
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Error al obtener el producto"));
  }
  return res.json();
}

export async function adminCreateProduct(password: string, data: any) {
  const res = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Error al crear producto"));
  }
  return res.json();
}

export async function adminUpdateProduct(password: string, id: string, data: any) {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Error al actualizar producto"));
  }
  return res.json();
}

export async function adminDeleteProduct(password: string, id: string) {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: { "x-admin-password": password },
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Error al eliminar producto"));
  }
  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}
