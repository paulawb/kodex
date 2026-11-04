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
    const slug = await this.uniqueSlug(productData.slug || productData.name);

    const created = await this.prisma.product.create({
      data: {
        name: productData.name,
        slug,
        description: productData.description,
        price: Number(productData.price) || 0,
        originalPrice:
          productData.originalPrice === null ||
          productData.originalPrice === undefined ||
          productData.originalPrice === ''
            ? null
            : Number(productData.originalPrice),
        category: productData.category,
        isFeatured: Boolean(productData.isFeatured),
        colors: {
          create: this.normalizeColors(colors).map((color) => ({
            name: color.name,
            hex: color.hex,
            images: color.images,
            variants: {
              create: color.variants,
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
    if (productData.description !== undefined && productData.description !== null) updateData.description = productData.description;
    if (productData.price !== undefined && productData.price !== null && productData.price !== '') {
      updateData.price = Number(productData.price);
    }
    if (productData.originalPrice === null || productData.originalPrice === '') {
      updateData.originalPrice = null;
    } else if (productData.originalPrice !== undefined) {
      updateData.originalPrice = Number(productData.originalPrice);
    }
    if (productData.category !== undefined && productData.category !== null) updateData.category = productData.category;
    if (productData.isFeatured !== undefined && productData.isFeatured !== null) {
      updateData.isFeatured = Boolean(productData.isFeatured);
    }

    if (productData.slug !== undefined && productData.slug !== null) {
      updateData.slug = await this.uniqueSlug(productData.slug, id);
    }

    const normalizedColors = Array.isArray(colors) ? this.normalizeColors(colors) : null;

    // Todo dentro de una transacción: si algo falla, no se pierden fotos ni tallas.
    const updated = await this.prisma.$transaction(async (tx) => {
      if (normalizedColors) {
        const existingColors = await tx.productColor.findMany({
          where: { productId: id },
          select: { id: true },
        });
        const colorIds = existingColors.map((c) => c.id);
        if (colorIds.length > 0) {
          await tx.productVariant.deleteMany({
            where: { colorId: { in: colorIds } },
          });
          await tx.productColor.deleteMany({
            where: { id: { in: colorIds } },
          });
        }
        updateData.colors = {
          create: normalizedColors.map((color) => ({
            name: color.name,
            hex: color.hex,
            images: color.images,
            variants: {
              create: color.variants,
            },
          })),
        };
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: this.include,
      });
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const colors = await tx.productColor.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const colorIds = colors.map((c) => c.id);
      if (colorIds.length > 0) {
        await tx.productVariant.deleteMany({
          where: { colorId: { in: colorIds } },
        });
        await tx.productColor.deleteMany({
          where: { id: { in: colorIds } },
        });
      }
      await tx.product.delete({ where: { id } });
    });
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const clean =
      String(base || 'producto')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'producto';

    let candidate = clean;
    let suffix = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing || (excludeId && existing.id === excludeId)) {
        return candidate;
      }
      suffix += 1;
      candidate = `${clean}-${suffix}`;
    }
  }

  private normalizeColors(colors: any[]): {
    name: string;
    hex: string | null;
    images: string[];
    variants: { size: string; stock: number }[];
  }[] {
    return (colors || []).map((color: any, index: number) => {
      const seen = new Set<string>();
      const variants: { size: string; stock: number }[] = [];

      for (const variant of Array.isArray(color?.variants) ? color.variants : []) {
        if (!variant || !variant.size) continue;
        const size = String(variant.size).trim();
        if (!size || seen.has(size)) continue;
        seen.add(size);
        variants.push({
          size,
          stock: Math.max(0, Math.trunc(Number(variant.stock)) || 0),
        });
      }

      return {
        name: String(color?.name || '').trim() || `Color ${index + 1}`,
        hex: color?.hex || null,
        images: Array.isArray(color?.images)
          ? color.images.filter((img: any) => typeof img === 'string' && img.length > 0)
          : [],
        variants,
      };
    });
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
