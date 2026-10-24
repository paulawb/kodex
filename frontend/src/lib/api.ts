const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
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

export async function adminGetProducts(password: string) {
  const res = await fetch(`${API_URL}/admin/products`, {
    headers: { "x-admin-password": password },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("No autorizado");
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
  if (!res.ok) throw new Error("Error al crear producto");
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
  if (!res.ok) throw new Error("Error al actualizar producto");
  return res.json();
}

export async function adminDeleteProduct(password: string, id: string) {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: { "x-admin-password": password },
  });
  if (!res.ok) throw new Error("Error al eliminar producto");
  return res.json();
}
