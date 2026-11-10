import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  /**
   * Listado para la tienda: usa SQL directo para NO traer las imágenes base64
   * a memoria. Devuelve solo el conteo de fotos por color.
   */
  async findLite(featuredOnly = false): Promise<any[]> {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p."originalPrice" AS "originalPrice",
        p.category,
        p."isFeatured" AS "isFeatured",
        p."freeShippingFusagasuga" AS "freeShippingFusagasuga",
        (p."sizeGuide" IS NOT NULL) AS "hasSizeGuide",
        p."createdAt" AS "createdAt",
        p."updatedAt" AS "updatedAt",
        c.id AS "colorId",
        c.name AS "colorName",
        c.hex AS "colorHex",
        COALESCE(array_length(c.images, 1), 0) AS "imageCount",
        v.id AS "variantId",
        v.size AS "size",
        v.stock AS "stock"
      FROM products p
      LEFT JOIN product_colors c ON c."productId" = p.id
      LEFT JOIN product_variants v ON v."colorId" = c.id
      ${featuredOnly ? Prisma.sql`WHERE p."isFeatured" = true` : Prisma.empty}
      ORDER BY p."createdAt" DESC, c."createdAt" ASC
    `;

    const byId = new Map<string, any>();

    for (const row of rows) {
      let product = byId.get(row.id);
      if (!product) {
        product = {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          price: row.price,
          originalPrice: row.originalPrice,
          category: row.category,
          isFeatured: row.isFeatured,
          freeShippingFusagasuga: row.freeShippingFusagasuga,
          hasSizeGuide: row.hasSizeGuide,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          colors: [],
          colorIndex: new Map<string, any>(),
        };
        byId.set(row.id, product);
      }

      if (!row.colorId) continue;

      let color = product.colorIndex.get(row.colorId);
      if (!color) {
        color = {
          id: row.colorId,
          name: row.colorName,
          hex: row.colorHex,
          imageCount: Number(row.imageCount) || 0,
          variants: [],
        };
        product.colorIndex.set(row.colorId, color);
        product.colors.push(color);
      }

      if (row.variantId) {
        color.variants.push({ id: row.variantId, size: row.size, stock: row.stock });
      }
    }

    return Array.from(byId.values()).map((product) => {
      delete product.colorIndex;
      return product;
    });
  }

  /** Trae solo la imagen pedida (no todo el producto). */
  async findImage(slug: string, index: number): Promise<{ mimeType: string; data: Buffer } | null> {
    const position = Math.max(0, Math.trunc(index)) + 1;
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT c.images[${position}] AS image
      FROM product_colors c
      JOIN products p ON p.id = c."productId"
      WHERE p.slug = ${slug}
      ORDER BY c."createdAt" ASC
      LIMIT 1
    `;

    return this.parseDataUrl(rows?.[0]?.image);
  }

  /** Trae solo la guía de tallas. */
  async findSizeGuide(slug: string): Promise<{ mimeType: string; data: Buffer } | null> {
    const row = await this.prisma.product.findUnique({
      where: { slug },
      select: { sizeGuide: true },
    });
    return this.parseDataUrl(row?.sizeGuide);
  }

  private parseDataUrl(value: unknown): { mimeType: string; data: Buffer } | null {
    if (typeof value !== 'string') return null;
    const match = /^data:([^;]+);base64,(.*)$/s.exec(value);
    if (!match) return null;
    return { mimeType: match[1], data: Buffer.from(match[2], 'base64') };
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
        sizeGuide: productData.sizeGuide || null,
        freeShippingFusagasuga: Boolean(productData.freeShippingFusagasuga),
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
    if (productData.sizeGuide !== undefined) {
      updateData.sizeGuide = productData.sizeGuide || null;
    }
    if (
      productData.freeShippingFusagasuga !== undefined &&
      productData.freeShippingFusagasuga !== null
    ) {
      updateData.freeShippingFusagasuga = Boolean(productData.freeShippingFusagasuga);
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
      p.sizeGuide ?? null,
      Boolean(p.freeShippingFusagasuga),
    );
  }
}
