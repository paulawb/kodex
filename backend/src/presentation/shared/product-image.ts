import { Request } from 'express';

/** Construye la URL base pública del backend (detrás de proxy de Render). */
export function baseUrlFrom(req: Request): string {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0];
  const proto = forwardedProto || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

/** Reemplaza las imágenes base64 por URLs con caché, para que el JSON sea liviano. */
/** Convierte un producto "lite" (sin base64) al JSON que consume la tienda. */
export function toListResponse(product: any, baseUrl: string) {
  const updated = product?.updatedAt ? new Date(product.updatedAt).getTime() : 0;
  const v = `?v=${updated || Date.now()}`;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    category: product.category,
    isFeatured: product.isFeatured,
    freeShippingFusagasuga: Boolean(product.freeShippingFusagasuga),
    sizeGuide: product.hasSizeGuide ? `${baseUrl}/products/${product.slug}/size-guide${v}` : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    colors: (product.colors || []).map((color: any) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
      images:
        Number(color.imageCount) > 0
          ? [`${baseUrl}/products/${product.slug}/image/0${v}`]
          : [],
      variants: color.variants || [],
    })),
  };
}

export function withImageUrls(product: any, baseUrl: string) {
  const slug = product?.slug;

  // Versión del caché: cambia cada vez que se edita el producto,
  // así el navegador descarga la foto nueva en lugar de la vieja.
  const updated = product?.updatedAt ? new Date(product.updatedAt).getTime() : 0;
  const version = Number.isFinite(updated) && updated > 0 ? updated : Date.now();
  const v = `?v=${version}`;

  return {
    ...product,
    sizeGuide: product?.sizeGuide ? `${baseUrl}/products/${slug}/size-guide${v}` : null,
    colors: (product?.colors || []).map((color: any) => ({
      ...color,
      images: (color?.images || []).map(
        (_image: string, index: number) => `${baseUrl}/products/${slug}/image/${index}${v}`
      ),
    })),
  };
}
