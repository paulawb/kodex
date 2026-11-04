export interface HeroConfig {
  /** Foto de fondo del banner.
   *  - Déjalo vacío ("") para usar automáticamente la primera foto de tus productos.
   *  - O usa una ruta local dentro de /public, ej: "/lookbook/banner.jpg"
   */
  image: string;
  /** Qué tan oscura se ve la foto detrás del texto (0 a 1). */
  overlay: number;
}

export const heroConfig: HeroConfig = {
  image: "",
  overlay: 0.72,
};
