export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex?: string | null;
  images: string[];
  variants: ProductVariant[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  isFeatured: boolean;
  colors: ProductColor[];
  createdAt: string;
  updatedAt: string;
}
