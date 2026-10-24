import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { IProductRepository } from '@domain/product/repository/product.repository.interface';
import { Product } from '@domain/product/entity/product.entity';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return products.map((p) => this.toEntity(p));
  }

  async findFeatured(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
    });
    return products.map((p) => this.toEntity(p));
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    return product ? this.toEntity(product) : null;
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? this.toEntity(product) : null;
  }

  async create(product: Partial<Product>): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        name: product.name!,
        slug: product.slug!,
        description: product.description!,
        price: product.price!,
        images: product.images || [],
        category: product.category!,
        sizes: product.sizes || [],
        stock: product.stock || 0,
        isFeatured: product.isFeatured || false,
      },
    });
    return this.toEntity(created);
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: product as any,
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  private toEntity(p: any): Product {
    return new Product(
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.images,
      p.category,
      p.sizes,
      p.stock,
      p.isFeatured,
      p.createdAt,
      p.updatedAt,
    );
  }
}
