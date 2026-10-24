import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';
import { Product } from '@domain/product/entity/product.entity';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(data: Partial<Product>): Promise<Product> {
    const slug = (data.name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return this.productRepository.create({ ...data, slug });
  }
}
