import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';

@Injectable()
export class GetAllProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  /** Listado liviano (sin imágenes en el JSON) para que la tienda cargue rápido. */
  async execute(): Promise<any[]> {
    return this.productRepository.findLite(false);
  }
}
