import {
  Controller,
  Get,
  Inject,
  Param,
  Header,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GetAllProductsUseCase } from '@application/product/use-cases/get-all-products.use-case';
import { GetFeaturedProductsUseCase } from '@application/product/use-cases/get-featured-products.use-case';
import { GetProductBySlugUseCase } from '@application/product/use-cases/get-product-by-slug.use-case';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repository/product.repository.interface';
import { baseUrlFrom, toListResponse, withImageUrls } from '@presentation/shared/product-image';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getFeaturedProductsUseCase: GetFeaturedProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  async findAll(@Req() req: Request) {
    const baseUrl = baseUrlFrom(req);
    const products = await this.getAllProductsUseCase.execute();
    return products.map((product) => toListResponse(product, baseUrl));
  }

  @Get('featured')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  async findFeatured(@Req() req: Request) {
    const baseUrl = baseUrlFrom(req);
    const products = await this.getFeaturedProductsUseCase.execute();
    return products.map((product) => toListResponse(product, baseUrl));
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const product = await this.getProductBySlugUseCase.execute(slug);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return withImageUrls(product, baseUrlFrom(req));
  }

  /** Guía de tallas como imagen cacheada. */
  @Get(':slug/size-guide')
  async sizeGuide(@Param('slug') slug: string, @Res() res: Response) {
    const image = await this.productRepository.findSizeGuide(slug);
    if (!image) throw new NotFoundException('Guía de tallas no encontrada');

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
  }

  /** Sirve la foto de un producto con caché larga (la usan <img> de la tienda). */
  @Get(':slug/image/:index')
  async image(
    @Param('slug') slug: string,
    @Param('index') index: string,
    @Res() res: Response,
  ) {
    const image = await this.productRepository.findImage(slug, Number(index));
    if (!image) throw new NotFoundException('Imagen no encontrada');

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
  }
}
