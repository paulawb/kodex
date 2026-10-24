"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/api";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { ShoppingBag } from "lucide-react";

export function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  useEffect(() => {
    getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize && product.sizes.length > 0) {
      alert("Selecciona una talla");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0] || "/placeholder.jpg",
      size: selectedSize,
      quantity: quantity,
    });

    const event = new CustomEvent("open-cart");
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden bg-accent">
          <img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {product.images.slice(1).map((img, idx) => (
              <div key={idx} className="aspect-square overflow-hidden bg-accent">
                <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">{product.category}</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">{product.name}</h1>
          <p className="text-2xl md:text-3xl font-bold">${product.price.toLocaleString("es-CO")}</p>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">TALLA</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                  className={selectedSize === size ? "bg-primary hover:bg-red-700" : ""}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-semibold">CANTIDAD</p>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          size="lg"
          className="w-full bg-primary hover:bg-red-700 text-lg"
          disabled={product.stock <= 0}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {product.stock <= 0 ? "AGOTADO" : "AÑADIR AL CARRITO"}
        </Button>

        {product.stock > 0 && product.stock < 10 && (
          <p className="text-sm text-primary">¡Solo quedan {product.stock} unidades!</p>
        )}
      </div>
    </div>
  );
}
