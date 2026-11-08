"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getProducts } from "@/lib/api";
import { isProductSoldOut } from "@/lib/product-utils";
import { Product } from "@/types/product";

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No hay productos disponibles</p>
      </div>
    );
  }

  const getMainImage = (product: Product) => {
    if (product.colors && product.colors.length > 0 && product.colors[0].images?.length > 0) {
      return product.colors[0].images[0];
    }
    return "/placeholder.svg";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/producto/${product.slug}`}>
          <Card className="group overflow-hidden border-border hover:border-primary transition-all duration-300 h-full">
            <div className="relative aspect-square overflow-hidden bg-accent">
              <img
                src={getMainImage(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {isProductSoldOut(product) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-600/35 backdrop-blur-[1px]">
                  <span className="-rotate-12 border-2 border-red-400/70 bg-black/30 px-4 py-2 text-2xl font-black uppercase tracking-widest text-red-300 shadow-lg sm:text-3xl">
                    Agotado
                  </span>
                </div>
              )}
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toLocaleString("es-CO")}</span>
                )}
                <p className="text-lg font-bold">${product.price.toLocaleString("es-CO")}</p>
              </div>
              <p className="text-xs text-muted-foreground">{product.category}</p>
              {product.colors && product.colors.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {product.colors.length} colores disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
