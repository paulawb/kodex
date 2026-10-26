export class ProductVariant {
  constructor(
    public readonly id: string,
    public size: string,
    public stock: number,
  ) {}
}

export class ProductColor {
  constructor(
    public readonly id: string,
    public name: string,
    public hex: string | null,
    public images: string[],
    public variants: ProductVariant[],
  ) {}
}

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public description: string,
    public price: number,
    public category: string,
    public isFeatured: boolean,
    public colors: ProductColor[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
