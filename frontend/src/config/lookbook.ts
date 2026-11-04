export interface LookbookItem {
  id: number;
  /** Foto del lookbook.
   *  Por defecto usa archivos locales de /public/lookbook/:
   *    - /lookbook/lookbook-1.jpg
   *    - /lookbook/lookbook-2.jpg
   *  Si el archivo no existe, se usa automáticamente una foto de tus productos.
   */
  image?: string;
  alt: string;
  title: string;
  subtitle: string;
}

export const lookbookItems: LookbookItem[] = [
  {
    id: 1,
    image: "/lookbook/lookbook-1.jpg",
    alt: "KØDEX lookbook 1",
    title: "URBAN",
    subtitle: "SIN CONCESIONES",
  },
  {
    id: 2,
    image: "/lookbook/lookbook-2.jpg",
    alt: "KØDEX lookbook 2",
    title: "ATTITUDE",
    subtitle: "ESCRIBE TU REGLA",
  },
];
