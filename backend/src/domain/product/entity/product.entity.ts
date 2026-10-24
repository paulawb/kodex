export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public description: string,
    public price: number,
    public images: string[],
    public category: string,
    public sizes: string[],
    public stock: number,
    public isFeatured: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
