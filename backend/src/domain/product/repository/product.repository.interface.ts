import { Product } from '../entity/product.entity';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findFeatured(): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  create(product: Partial<Product>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
