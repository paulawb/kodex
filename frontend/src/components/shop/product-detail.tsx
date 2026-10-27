"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/api";
import { Product, ProductColor } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { ShoppingBag } from "lucide-react";

export function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          const firstColor = data.colors[0];
          setSelectedColor(firstColor);
          if (firstColor.variants && firstColor.variants.length > 0) {
            setSelectedSize(firstColor.variants[0].size);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setCurrentImageIndex(0);
    if (selectedColor && selectedColor.variants && selectedColor.variants.length > 0) {
      setSelectedSize(selectedColor.variants[0].size);
    } else {
      setSelectedSize("");
    }
  }, [selectedColor]);

  const handleAddToCart = () => {
    if (!product || !selectedColor) return;
    if (!selectedSize) {
      alert("Selecciona una talla");
      return;
    }

    const variant = selectedColor.variants.find((v) => v.size === selectedSize);
    if (variant && variant.stock <= 0) {
      alert("Esta talla no está disponible");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: selectedColor.images[0] || "/placeholder.jpg",
      size: selectedSize,
      color: selectedColor.name,
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

  const images = selectedColor?.images || [];
  const availableVariants = selectedColor?.variants || [];
  const currentVariant = availableVariants.find((v) => v.size === selectedSize);
  const isOutOfStock = currentVariant ? currentVariant.stock <= 0 : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden bg-accent">
          <img
            src={images[currentImageIndex] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`aspect-square overflow-hidden bg-accent border-2 transition-colors ${
                  currentImageIndex === idx ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
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

        {product.colors && product.colors.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">COLOR: {selectedColor?.name}</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border-2 rounded-md transition-colors ${
                    selectedColor?.id === color.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-sm font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {availableVariants.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">TALLA</p>
            <div className="flex flex-wrap gap-2">
              {availableVariants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedSize === variant.size ? "default" : "outline"}
                  onClick={() => setSelectedSize(variant.size)}
                  disabled={variant.stock <= 0}
                  className={`${selectedSize === variant.size ? "bg-primary hover:bg-red-700" : ""} ${
                    variant.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {variant.size}
                  {variant.stock <= 0 && " (AGOTADO)"}
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
              disabled={currentVariant ? quantity >= currentVariant.stock : false}
            >
              +
            </Button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          size="lg"
          className="w-full bg-primary hover:bg-red-700 text-lg"
          disabled={!selectedColor || availableVariants.length === 0 || isOutOfStock}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {isOutOfStock || availableVariants.length === 0 ? "AGOTADO" : "AÑADIR AL CARRITO"}
        </Button>

        {currentVariant && currentVariant.stock > 0 && currentVariant.stock < 10 && (
          <p className="text-sm text-primary">¡Solo quedan {currentVariant.stock} unidades en esta talla!</p>
        )}
      </div>
    </div>
  );
}
