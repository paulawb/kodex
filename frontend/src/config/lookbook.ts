export interface LookbookItem {
  id: number;
  image: string;
  alt: string;
  title: string;
  subtitle: string;
}

export const lookbookItems: LookbookItem[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1000&fit=crop",
    alt: "KØDEX lookbook 1",
    title: "URBAN",
    subtitle: "SIN CONCESIONES",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=1000&fit=crop",
    alt: "KØDEX lookbook 2",
    title: "ATTITUDE",
    subtitle: "ESCRIBE TU REGLA",
  },
];
