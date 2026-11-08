import { Request } from 'express';

/** Construye la URL base pública del backend (detrás de proxy de Render). */
export function baseUrlFrom(req: Request): string {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0];
  const proto = forwardedProto || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

/** Reemplaza las imágenes base64 por URLs con caché, para que el JSON sea liviano. */
export function withImageUrls(product: any, baseUrl: string) {
  const slug = product?.slug;
  return {
    ...product,
    sizeGuide: product?.sizeGuide ? `${baseUrl}/products/${slug}/size-guide` : null,
    colors: (product?.colors || []).map((color: any) => ({
      ...color,
      images: (color?.images || []).map(
        (_image: string, index: number) => `${baseUrl}/products/${slug}/image/${index}`
      ),
    })),
  };
}
