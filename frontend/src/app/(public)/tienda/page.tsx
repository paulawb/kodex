import { ProductGrid } from "@/components/shop/product-grid";

export const metadata = {
  title: "Tienda | KØDEX",
  description: "Explora toda la colección KØDEX - Streetwear sin reglas",
};

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
          TIENDA
        </h1>
        <p className="text-lg text-muted-foreground">
          Colección completa KØDEX
        </p>
      </div>
      <ProductGrid />
    </div>
  );
}
