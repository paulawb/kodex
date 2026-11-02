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
      orderBy: {
        createdAt: 'asc' as const,
      },
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
        originalPrice: productData.originalPrice ?? null,
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
      } as any,
      include: this.include,
    });

    return this.toEntity(created);
  }

  async update(id: string, product: any): Promise<Product> {
    const { colors, ...productData } = product;

    const updateData: any = {};

    if (productData.name !== undefined && productData.name !== null) updateData.name = productData.name;
    if (productData.slug !== undefined && productData.slug !== null) updateData.slug = productData.slug;
    if (productData.description !== undefined && productData.description !== null) updateData.description = productData.description;
    if (productData.price !== undefined && productData.price !== null && productData.price !== '') updateData.price = Number(productData.price);
    if (productData.originalPrice === null || productData.originalPrice === '') {
      updateData.originalPrice = null;
    } else if (productData.originalPrice !== undefined && productData.originalPrice !== '') {
      updateData.originalPrice = Number(productData.originalPrice);
    }
    if (productData.category !== undefined && productData.category !== null) updateData.category = productData.category;
    if (productData.isFeatured !== undefined && productData.isFeatured !== null) updateData.isFeatured = Boolean(productData.isFeatured);

    if (Array.isArray(colors)) {
      await this.prisma.productColor.deleteMany({
        where: { productId: id },
      });
      updateData.colors = {
        create: colors.map((color: any) => ({
          name: color.name || '',
          hex: color.hex || null,
          images: Array.isArray(color.images) ? color.images.filter((img: any) => typeof img === 'string' && img.length > 0) : [],
          variants: {
            create: Array.isArray(color.variants) ? color.variants.map((variant: any) => ({
              size: variant.size || '',
              stock: Number(variant.stock) || 0,
            })) : [],
          },
        })),
      };
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: updateData,
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
      p.originalPrice ?? null,
    );
  }
}
