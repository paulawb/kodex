import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { IProductRepository } from '@domain/product/repository/product.repository.interface';
import { Product, ProductColor, ProductVariant } from '@domain/product/entity/product.entity';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = {
    colors: {
      include: {
        variants: true,
      },
      orderBy: { createdAt: 'asc' },
    },
  };

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
    return products.map((p) => this.toEntity(p));
  }

  async findFeatured(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { isFeatured: true },
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
    return products.map((p) => this.toEntity(p));
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: this.include,
    });
    return product ? this.toEntity(product) : null;
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.include,
    });
    return product ? this.toEntity(product) : null;
  }

  async create(product: any): Promise<Product> {
    const { colors = [], ...productData } = product;

    const created = await this.prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        isFeatured: productData.isFeatured || false,
        colors: {
          create: colors.map((color: any) => ({
            name: color.name,
            hex: color.hex || null,
            images: color.images || [],
            variants: {
              create: (color.variants || []).map((variant: any) => ({
                size: variant.size,
                stock: variant.stock || 0,
              })),
            },
          })),
        },
      },
      include: this.include,
    });

    return this.toEntity(created);
  }

  async update(id: string, product: any): Promise<Product> {
    const { colors = [], ...productData } = product;

    await this.prisma.productColor.deleteMany({
      where: { productId: id },
    });

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        colors: {
          create: colors.map((color: any) => ({
            name: color.name,
            hex: color.hex || null,
            images: color.images || [],
            variants: {
              create: (color.variants || []).map((variant: any) => ({
                size: variant.size,
                stock: variant.stock || 0,
              })),
            },
          })),
        },
      },
      include: this.include,
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  private toEntity(p: any): Product {
    const colors = (p.colors || []).map(
      (color: any) =>
        new ProductColor(
          color.id,
          color.name,
          color.hex,
          color.images || [],
          (color.variants || []).map(
            (variant: any) => new ProductVariant(variant.id, variant.size, variant.stock),
          ),
        ),
    );

    return new Product(
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.category,
      p.isFeatured,
      colors,
      p.createdAt,
      p.updatedAt,
    );
  }
}
