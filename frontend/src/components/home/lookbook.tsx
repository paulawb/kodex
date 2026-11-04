"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import { lookbookItems } from "@/config/lookbook";
import { Product } from "@/types/product";

const FALLBACK_IMAGE = "/placeholder.svg";

function productPhotos(products: Product[]): string[] {
  const photos: string[] = [];
  for (const product of products || []) {
    for (const color of product.colors || []) {
      for (const image of color.images || []) {
        if (typeof image === "string" && image.length > 0) {
          photos.push(image);
        }
      }
    }
  }
  return photos;
}

export function Lookbook() {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    getProducts()
      .then((products: Product[]) => setPhotos(productPhotos(products)))
      .catch(() => setPhotos([]));
  }, []);

  const items = lookbookItems.map((item, index) => {
    const configured = typeof item.image === "string" ? item.image : "";
    const fromStore = photos[index] || "";
    const image = fromStore || (configured.startsWith("/") ? configured : "") || FALLBACK_IMAGE;
    return { ...item, image };
  });

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
            LOOK<span className="text-primary">BOOK</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Actitud. Identidad. Sin reglas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href="/tienda"
              className="relative aspect-[4/5] overflow-hidden group block"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
              <img
                src={item.image}
                alt={item.alt}
                onError={(event) => {
                  const img = event.currentTarget;
                  if (!img.src.endsWith(FALLBACK_IMAGE)) {
                    img.src = FALLBACK_IMAGE;
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <p className="text-2xl font-bold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
