"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFeaturedProducts } from "@/lib/api";
import { Product } from "@/types/product";

export function FeaturedCollection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
            COLECCIÓN <span className="text-primary">DESTACADA</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Las piezas más representativas de KØDEX
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product) => {
            const mainImage = product.colors && product.colors.length > 0 && product.colors[0].images?.length > 0
              ? product.colors[0].images[0]
              : "/placeholder.jpg";
            return (
              <Link key={product.id} href={`/producto/${product.slug}`}>
                <Card className="group overflow-hidden border-border hover:border-primary transition-all duration-300">
                  <div className="aspect-square overflow-hidden bg-accent">
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold">${product.price.toLocaleString("es-CO")}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Link href="/tienda">VER TODA LA COLECCIÓN</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
