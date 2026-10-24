import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { CreateProductUseCase } from '@application/product/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '@application/product/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '@application/product/use-cases/delete-product.use-case';
import { GetAllProductsUseCase } from '@application/product/use-cases/get-all-products.use-case';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Get('products')
  findAll() {
    return this.getAllProductsUseCase.execute();
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
  delete(@Param('id') id: string) {
    return this.deleteProductUseCase.execute(id);
  }
}
