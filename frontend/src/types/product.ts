export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  stock: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
