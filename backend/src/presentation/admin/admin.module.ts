import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CreateProductUseCase } from '@application/product/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '@application/product/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '@application/product/use-cases/delete-product.use-case';
import { GetAllProductsUseCase } from '@application/product/use-cases/get-all-products.use-case';
import { PrismaProductRepository } from '@infrastructure/product/repository/prisma-product.repository';
import { PRODUCT_REPOSITORY } from '@domain/product/repository/product.repository.interface';

@Module({
  controllers: [AdminController],
  providers: [
    GetAllProductsUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
})
export class AdminModule {}
