import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { GetAllProductsUseCase } from '@application/product/use-cases/get-all-products.use-case';
import { GetFeaturedProductsUseCase } from '@application/product/use-cases/get-featured-products.use-case';
import { GetProductBySlugUseCase } from '@application/product/use-cases/get-product-by-slug.use-case';
import { PrismaProductRepository } from '@infrastructure/product/repository/prisma-product.repository';
import { PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';

@Module({
  controllers: [ProductController],
  providers: [
    GetAllProductsUseCase,
    GetFeaturedProductsUseCase,
    GetProductBySlugUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
})
export class ProductModule {}
