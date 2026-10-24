import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return this.productRepository.delete(id);
  }
}
