import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';
import { Product } from '@domain/product/entity/product.entity';

@Injectable()
export class GetAllProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(): Promise<Product[]> {
    const products = await this.productRepository.findAll();

    // Para listados solo hace falta la primera foto de cada color.
    // Así la respuesta pesa mucho menos y la tienda carga rápido.
    return products.map((product) => ({
      ...product,
      colors: (product.colors || []).map((color) => ({
        ...color,
        images: (color.images || []).slice(0, 1),
      })),
    })) as Product[];
  }
}
