import { Product } from "@/types/product";

// Caché en memoria: cuando el listado del admin carga los productos,
// al abrir "editar" ya tenemos los datos sin volver a pedirlos al servidor.
let productsById: Record<string, Product> = {};

export function setCachedProducts(products: Product[]): void {
  const next: Record<string, Product> = {};
  for (const product of products || []) {
    if (product?.id) next[product.id] = product;
  }
  productsById = next;
}

export function getCachedProduct(id: string): Product | null {
  return productsById[id] || null;
}

export function updateCachedProduct(product: Product): void {
  if (product?.id) productsById[product.id] = product;
}
