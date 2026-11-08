import {
  Controller,
  Get,
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
import { baseUrlFrom, withImageUrls } from '@presentation/shared/product-image';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getFeaturedProductsUseCase: GetFeaturedProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  async findAll(@Req() req: Request) {
    const baseUrl = baseUrlFrom(req);
    const products = await this.getAllProductsUseCase.execute();
    return products.map((product) => withImageUrls(product, baseUrl));
  }

  @Get('featured')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  async findFeatured(@Req() req: Request) {
    const baseUrl = baseUrlFrom(req);
    const products = await this.getFeaturedProductsUseCase.execute();
    return products.map((product) => withImageUrls(product, baseUrl));
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const product = await this.getProductBySlugUseCase.execute(slug);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return withImageUrls(product, baseUrlFrom(req));
  }

  /** Sirve la foto de un producto con caché larga (la usan <img> de la tienda). */
  @Get(':slug/image/:index')
  async image(
    @Param('slug') slug: string,
    @Param('index') index: string,
    @Res() res: Response,
  ) {
    const product: any = await this.getProductBySlugUseCase.execute(slug);
    if (!product) throw new NotFoundException('Producto no encontrado');

    const color = product.colors?.[0];
    const dataUrl = color?.images?.[Number(index)];
    if (typeof dataUrl !== 'string') throw new NotFoundException('Imagen no encontrada');

    const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
    if (!match) throw new NotFoundException('Imagen no encontrada');

    const [, mimeType, base64] = match;
    const buffer = Buffer.from(base64, 'base64');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  }
}
