import { Controller, Get, Param } from '@nestjs/common';
import { GetAllProductsUseCase } from '@application/product/use-cases/get-all-products.use-case';
import { GetFeaturedProductsUseCase } from '@application/product/use-cases/get-featured-products.use-case';
import { GetProductBySlugUseCase } from '@application/product/use-cases/get-product-by-slug.use-case';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getFeaturedProductsUseCase: GetFeaturedProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
  ) {}

  @Get()
  findAll() {
    return this.getAllProductsUseCase.execute();
  }

  @Get('featured')
  findFeatured() {
    return this.getFeaturedProductsUseCase.execute();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.getProductBySlugUseCase.execute(slug);
  }
}
