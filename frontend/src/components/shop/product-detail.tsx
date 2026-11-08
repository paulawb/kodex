"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/api";
import { Product, ProductColor } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { isProductSoldOut } from "@/lib/product-utils";
import { ShoppingBag, Truck, Ruler, X } from "lucide-react";

export function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

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
    setQuantity(1);
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
    if (!variant || variant.stock <= 0) {
      alert("Esta talla no está disponible");
      return;
    }

    const inCart = cartItems
      .filter(
        (item) =>
          item.id === product.id &&
          item.size === selectedSize &&
          item.color === selectedColor.name
      )
      .reduce((total, item) => total + item.quantity, 0);

    const available = variant.stock - inCart;
    if (available <= 0) {
      alert(`Ya tienes todas las unidades disponibles en el carrito (${variant.stock}).`);
      return;
    }

    if (quantity > available) {
      alert(
        `Solo quedan ${available} unidades disponibles de esta talla${
          inCart > 0 ? ` (ya tienes ${inCart} en el carrito)` : ""
        }.`
      );
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: selectedColor.images[0] || "/placeholder.svg",
      size: selectedSize,
      color: selectedColor.name,
      quantity: quantity,
      stock: variant.stock,
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

  const inCartForSelection = cartItems
    .filter(
      (item) =>
        item.id === product.id &&
        item.size === selectedSize &&
        item.color === selectedColor?.name
    )
    .reduce((total, item) => total + item.quantity, 0);

  const remainingStock = currentVariant
    ? Math.max(0, currentVariant.stock - inCartForSelection)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden bg-accent">
          <img
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {isProductSoldOut(product) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-600/35 backdrop-blur-[1px]">
              <span className="-rotate-12 border-2 border-red-400/70 bg-black/30 px-6 py-3 text-3xl font-black uppercase tracking-widest text-red-300 shadow-lg sm:text-4xl">
                Agotado
              </span>
            </div>
          )}
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
          <div className="flex items-center gap-3">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xl md:text-2xl text-muted-foreground line-through">${product.originalPrice.toLocaleString("es-CO")}</span>
            )}
            <p className="text-2xl md:text-3xl font-bold">${product.price.toLocaleString("es-CO")}</p>
          </div>
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
                  onClick={() => {
                    setSelectedSize(variant.size);
                    setQuantity(1);
                  }}
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
              onClick={() => setQuantity(Math.min(quantity + 1, Math.max(1, remainingStock)))}
              disabled={remainingStock <= quantity}
            >
              +
            </Button>
          </div>
        </div>

        {product.freeShippingFusagasuga && (
          <div className="flex items-center gap-3 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-3">
            <Truck className="h-6 w-6 flex-shrink-0 text-green-400" />
            <p className="text-base font-extrabold uppercase tracking-wide text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.45)]">
              Envío gratis en Fusagasugá
            </p>
          </div>
        )}

        {product.sizeGuide && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowSizeGuide(true)}
          >
            <Ruler className="mr-2 h-4 w-4" />
            VER GUÍA DE TALLAS
          </Button>
        )}

        <Button
          onClick={handleAddToCart}
          size="lg"
          className="w-full bg-primary hover:bg-red-700 text-lg"
          disabled={
            !selectedColor || availableVariants.length === 0 || isOutOfStock || remainingStock <= 0
          }
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {isOutOfStock || availableVariants.length === 0
            ? "AGOTADO"
            : remainingStock <= 0
            ? "YA TIENES TODO EN EL CARRITO"
            : "AÑADIR AL CARRITO"}
        </Button>

        {currentVariant && currentVariant.stock > 0 && (
          <p className="text-sm text-primary">
            {remainingStock <= 0
              ? `Ya tienes las ${currentVariant.stock} unidades disponibles en el carrito.`
              : currentVariant.stock < 10
              ? `¡Solo quedan ${currentVariant.stock} unidades en esta talla!`
              : `Disponibles: ${currentVariant.stock} unidades.`}
          </p>
        )}
      </div>

      {showSizeGuide && product.sizeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border bg-background p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-background/80"
              onClick={() => setShowSizeGuide(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wider">
              Guía de tallas
            </p>
            <img
              src={product.sizeGuide}
              alt={`Guía de tallas de ${product.name}`}
              className="h-auto w-full rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
