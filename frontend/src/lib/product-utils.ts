import { Product } from "@/types/product";

/** true si el producto no tiene stock en ninguna talla de ningún color. */
export function isProductSoldOut(product: Pick<Product, "colors"> | null | undefined): boolean {
  const colors = product?.colors || [];
  if (colors.length === 0) return true;
  return !colors.some((color) =>
    (color.variants || []).some((variant) => Number(variant.stock) > 0)
  );
}
