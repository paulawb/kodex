import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';
import { Product } from '@domain/product/entity/product.entity';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, data: Partial<Product>): Promise<Product> {
    if (data.name) {
      const slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      data.slug = slug;
    }
    return this.productRepository.update(id, data);
  }
}
