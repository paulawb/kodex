export interface LookbookItem {
  id: number;
  /** Opcional: ruta local dentro de /public (ej: "/lookbook/1.jpg").
   *  Si se deja vacío, se usan las fotos de los productos de la tienda. */
  image?: string;
  alt: string;
  title: string;
  subtitle: string;
}

export const lookbookItems: LookbookItem[] = [
  {
    id: 1,
    image: "",
    alt: "KØDEX lookbook 1",
    title: "URBAN",
    subtitle: "SIN CONCESIONES",
  },
  {
    id: 2,
    image: "",
    alt: "KØDEX lookbook 2",
    title: "ATTITUDE",
    subtitle: "ESCRIBE TU REGLA",
  },
];
