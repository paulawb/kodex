import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { baseUrlFrom, withImageUrls } from '@presentation/shared/product-image';
import { AdminGuard } from './admin.guard';
import { CreateProductUseCase } from '@application/product/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '@application/product/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '@application/product/use-cases/delete-product.use-case';
import { GetAllProductsUseCase } from '@application/product/use-cases/get-all-products.use-case';
import { GetProductByIdUseCase } from '@application/product/use-cases/get-product-by-id.use-case';
import { SettingsService } from '@infrastructure/settings/settings.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Get('settings')
  getSettings() {
    return this.settingsService.getPublic();
  }

  @Put('settings')
  updateSettings(@Body() body: any) {
    return this.settingsService.update(body);
  }

  @Get('products')
  async findAll(@Req() req: Request) {
    const baseUrl = baseUrlFrom(req);
    const products = await this.getAllProductsUseCase.execute();
    return products.map((product) => withImageUrls(product, baseUrl));
  }

  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.getProductByIdUseCase.execute(id);
  }

  @Post('products')
  create(@Body() body: any) {
    return this.createProductUseCase.execute(body);
  }

  @Put('products/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.updateProductUseCase.execute(id, body);
  }

  @Delete('products/:id')
  async delete(@Param('id') id: string) {
    await this.deleteProductUseCase.execute(id);
    return { success: true };
  }
}
