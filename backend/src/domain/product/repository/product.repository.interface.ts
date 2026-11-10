import { Product } from '../entity/product.entity';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findFeatured(): Promise<Product[]>;
  /** Listado liviano: no carga las imágenes en memoria. */
  findLite(featuredOnly?: boolean): Promise<any[]>;
  findImage(
    slug: string,
    index: number,
  ): Promise<{ mimeType: string; data: Buffer } | { redirectUrl: string } | null>;
  findSizeGuide(
    slug: string,
  ): Promise<{ mimeType: string; data: Buffer } | { redirectUrl: string } | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  create(product: any): Promise<Product>;
  update(id: string, product: any): Promise<Product>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
