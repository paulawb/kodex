import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';
import { Product } from '@domain/product/entity/product.entity';

@Injectable()
export class GetProductBySlugUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(slug: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }
}
