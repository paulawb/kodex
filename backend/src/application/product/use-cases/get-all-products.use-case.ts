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
    return this.productRepository.findAll();
  }
}
