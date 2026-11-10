"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { adminCreateProduct, adminGetProduct, adminUpdateProduct } from "@/lib/api";
import { getAdminPass } from "@/lib/admin-auth";
import { getCachedProduct, updateCachedProduct } from "@/lib/admin-products-cache";
import { ImageCropper } from "@/components/admin/image-cropper";
import Image from "next/image";
import { Crop, Plus, Trash2, Upload, X } from "lucide-react";

interface ProductFormProps {
  id: string | null;
}

interface Variant {
  size: string;
  stock: number;
}

interface ColorForm {
  id?: string;
  name: string;
  hex: string;
  images: string[];
  variants: Variant[];
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"];

/** Sube la imagen a Vercel Blob y devuelve la URL pública. */
async function uploadImage(dataUrl: string): Promise<string> {
  // Si ya es una URL (foto existente), no hay nada que subir.
  if (/^https?:\/\//i.test(dataUrl)) return dataUrl;

  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("file", blob, "foto.jpg");

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    let message = "No se pudo subir la imagen";
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {}
    throw new Error(message);
  }

  const json = await res.json();
  return json.url as string;
}

const COLOR_PALETTE = [
  "#000000", "#FFFFFF", "#FF0000", "#DC2626", "#B91C1C", "#991B1B",
  "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F",
  "#10B981", "#059669", "#047857", "#065F46", "#064E3B",
  "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A",
  "#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95",
  "#EC4899", "#DB2777", "#BE185D", "#9D174D", "#831843",
  "#F97316", "#EA580C", "#C2410C", "#9A3412", "#7C2D12",
  "#EAB308", "#CA8A04", "#A16207", "#854D0E", "#713F12",
  "#6B7280", "#4B5563", "#374151", "#1F2937", "#111827",
  "#A3A3A3", "#737373", "#525252", "#404040", "#262626",
  "#D4D4D4", "#A1A1A1", "#22D3EE", "#06B6D4", "#0891B2",
  "#84CC16", "#65A30D", "#4D7C0F", "#BE123C", "#E11D48",
];

export function ProductForm({ id }: ProductFormProps) {
  // v2 - colores por producto con tallas por color v3 - solo delantero/trasero
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(id));
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: "" as any,
    category: "",
    isFeatured: false,
    freeShippingFusagasuga: false,
  });

  const [sizeGuide, setSizeGuide] = useState("");

  const [cropTarget, setCropTarget] = useState<{
    colorIndex: number;
    imageIndex: number;
    src: string;
  } | null>(null);

  const [colors, setColors] = useState<ColorForm[]>([
    {
      name: "",
      hex: "#000000",
      images: ["", ""],
      variants: [],
    },
  ]);

  const applyProduct = (product: any) => {
    if (!product) return;
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      originalPrice: product.originalPrice ?? "",
      category: product.category || "",
      isFeatured: product.isFeatured || false,
      freeShippingFusagasuga: Boolean(product.freeShippingFusagasuga),
    });
    setSizeGuide(product.sizeGuide || "");
    if (product.colors && product.colors.length > 0) {
      setColors(
        product.colors.map((color: any) => ({
          id: color.id,
          name: color.name || "",
          hex: color.hex || "#000000",
          images: [color.images?.[0] || "", color.images?.[1] || ""],
          variants: (color.variants || []).map((v: any) => ({
            size: v.size,
            stock: v.stock || 0,
          })),
        }))
      );
    }
  };

  useEffect(() => {
    if (!id) {
      setLoadingProduct(false);
      return;
    }

    const pass = getAdminPass();
    if (!pass) {
      router.push("/adminmp/login");
      return;
    }

    // Si venimos del listado, ya tenemos el producto en memoria: se abre al instante.
    const cached = getCachedProduct(id);
    if (cached) {
      applyProduct(cached);
      setLoadingProduct(false);
      return;
    }

    adminGetProduct(pass, id)
      .then((product) => {
        applyProduct(product);
        updateCachedProduct(product);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoadingProduct(false));
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addColor = () => {
    setColors([
      ...colors,
      {
        name: "",
        hex: "#000000",
        images: ["", ""],
        variants: [],
      },
    ]);
  };

  const removeColor = (index: number) => {
    if (colors.length === 1) {
      alert("Debe haber al menos un color");
      return;
    }
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, field: keyof ColorForm, value: any) => {
    const newColors = [...colors];
    (newColors[index] as any)[field] = value;
    setColors(newColors);
  };

  const handleImageUpload = (colorIndex: number, imageIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten archivos JPG, JPEG o PNG");
      e.target.value = "";
      return;
    }
    if (file.size > maxSize) {
      alert("Cada imagen no debe superar los 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Abrimos el recortador antes de guardar la foto.
      setCropTarget({ colorIndex, imageIndex, src: result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyCrop = async (dataUrl: string) => {
    if (!cropTarget) return;
    const { colorIndex, imageIndex } = cropTarget;

    setUploading(true);
    try {
      const url = await uploadImage(dataUrl);
      setColors((prevColors) => {
        const newColors = [...prevColors];
        const newImages = [...newColors[colorIndex].images];
        newImages[imageIndex] = url;
        newColors[colorIndex].images = newImages;
        return newColors;
      });
      setCropTarget(null);
    } catch (error: any) {
      alert(error?.message || "No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const addVariant = (colorIndex: number) => {
    setColors((prevColors) => {
      const newColors = [...prevColors];
      newColors[colorIndex].variants.push({ size: "M", stock: 0 });
      return newColors;
    });
  };

  const updateVariant = (colorIndex: number, variantIndex: number, field: keyof Variant, value: any) => {
    setColors((prevColors) => {
      const newColors = [...prevColors];
      newColors[colorIndex].variants[variantIndex] = {
        ...newColors[colorIndex].variants[variantIndex],
        [field]: field === "stock" ? Number(value) : value,
      };
      return newColors;
    });
  };

  const removeVariant = (colorIndex: number, variantIndex: number) => {
    setColors((prevColors) => {
      const newColors = [...prevColors];
      newColors[colorIndex].variants = newColors[colorIndex].variants.filter((_, i) => i !== variantIndex);
      return newColors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = getAdminPass();
    if (!pass) {
      router.push("/adminmp/login");
      return;
    }

    for (let i = 0; i < colors.length; i++) {
      if (!colors[i].name.trim()) {
        alert(`Debes ingresar el nombre del color ${i + 1}`);
        return;
      }
      if (!colors[i].images[0] || !colors[i].images[1]) {
        alert(`Debes subir la foto frontal y trasera para el color "${colors[i].name}"`);
        return;
      }
      if (colors[i].variants.length === 0) {
        alert(`Debes agregar al menos una talla para el color "${colors[i].name}"`);
        return;
      }
    }

    setLoading(true);
    try {
      const data: any = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        isFeatured: formData.isFeatured,
        freeShippingFusagasuga: formData.freeShippingFusagasuga,
        sizeGuide: sizeGuide || null,
        originalPrice: formData.originalPrice === "" || formData.originalPrice === null || formData.originalPrice === undefined ? null : Number(formData.originalPrice),
        colors: colors.map((color) => ({
          name: color.name,
          hex: color.hex,
          images: [color.images[0], color.images[1]].filter(Boolean),
          variants: color.variants.map((v) => ({
            size: v.size,
            stock: Number(v.stock) || 0,
          })),
        })),
      };

      if (id) {
        await adminUpdateProduct(pass, id, data);
      } else {
        await adminCreateProduct(pass, data);
      }
      router.push("/adminmp/dashboard");
    } catch (error: any) {
      console.error("Error al guardar producto:", error);
      alert(typeof error?.message === "string" ? error.message : "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <Card>
        <CardContent className="py-20 text-center space-y-2">
          <p className="text-muted-foreground">Cargando producto...</p>
          <p className="text-xs text-muted-foreground">
            Si tarda mucho, vuelve al panel e inténtalo de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Camisetas, Pantalones, etc."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Precio original (opcional)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="Ej: 199000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio con descuento *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="isFeatured">Producto destacado</Label>
            </div>
          </div>
          {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
            <p className="text-sm text-muted-foreground">
              Vista previa: <span className="line-through text-muted-foreground">${Number(formData.originalPrice).toLocaleString("es-CO")}</span>{" "}
              <span className="text-lg font-bold text-primary">${Number(formData.price).toLocaleString("es-CO")}</span>
            </p>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="freeShippingFusagasuga"
              name="freeShippingFusagasuga"
              checked={formData.freeShippingFusagasuga}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <Label htmlFor="freeShippingFusagasuga">
              Envío gratis en Fusagasugá (se muestra en la prenda)
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Guía de tallas (opcional)</Label>
            <p className="text-sm text-muted-foreground">
              Imagen que el cliente podrá ver en la prenda para saber qué talla elegir
            </p>
            {sizeGuide ? (
              <div className="relative w-full max-w-sm overflow-hidden rounded-md border bg-accent">
                <img src={sizeGuide} alt="Guía de tallas" className="w-full h-auto" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => setSizeGuide("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-sm hover:bg-muted/50">
                <Upload className="h-5 w-5 text-muted-foreground" />
                Subir guía de tallas
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
                      alert("Solo se permiten imágenes JPG, PNG o WEBP");
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      alert("La imagen no debe superar 10 MB");
                      return;
                    }
                    // Comprimimos la guía y la subimos a Vercel Blob (no a la base de datos).
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const original = String(reader.result);
                      let toUpload = original;

                      try {
                        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                          const image = new window.Image();
                          image.onload = () => resolve(image);
                          image.onerror = reject;
                          image.src = original;
                        });

                        const maxWidth = 1000;
                        const scale = Math.min(1, maxWidth / img.width);
                        const canvas = document.createElement("canvas");
                        canvas.width = Math.round(img.width * scale);
                        canvas.height = Math.round(img.height * scale);
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                          ctx.imageSmoothingQuality = "high";
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                          toUpload = canvas.toDataURL("image/jpeg", 0.8);
                        }
                      } catch {}

                      setUploading(true);
                      try {
                        setSizeGuide(await uploadImage(toUpload));
                      } catch (error: any) {
                        alert(error?.message || "No se pudo subir la guía de tallas");
                      } finally {
                        setUploading(false);
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg">Colores, imágenes, tallas y stock *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Agrega cada color con sus propias fotos, tallas disponibles y cantidad por talla
                </p>
              </div>
              <Button type="button" onClick={addColor} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir color
              </Button>
            </div>

            {colors.map((color, colorIndex) => (
              <Card key={colorIndex} className="border-2">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Color {colorIndex + 1}</h4>
                    {colors.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeColor(colorIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar color
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del color *</Label>
                        <Input
                          value={color.name}
                          onChange={(e) => updateColor(colorIndex, "name", e.target.value)}
                          placeholder="Negro, Blanco, Rojo..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color seleccionado</Label>
                        <div className="flex gap-2 items-center">
                          <div
                            className="w-10 h-10 rounded-md border-2 border-border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <Input
                            value={color.hex}
                            onChange={(e) => updateColor(colorIndex, "hex", e.target.value)}
                            placeholder="#000000"
                          />
                          <Input
                            type="color"
                            value={color.hex}
                            onChange={(e) => updateColor(colorIndex, "hex", e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Paleta de colores (click para seleccionar)</Label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                        {COLOR_PALETTE.map((colorHex) => (
                          <button
                            key={colorHex}
                            type="button"
                            onClick={() => updateColor(colorIndex, "hex", colorHex)}
                            className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                              color.hex === colorHex ? "border-primary ring-2 ring-primary/50" : "border-border"
                            }`}
                            style={{ backgroundColor: colorHex }}
                            title={colorHex}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Fotos de este color * (Delantero y Trasero - JPG, JPEG, PNG)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[0, 1].map((imgIndex) => (
                        <div key={imgIndex} className="space-y-2">
                          <Label className="text-xs">{imgIndex === 0 ? "Delantero *" : "Trasero *"}</Label>
                          {color.images[imgIndex] ? (
                            <div className="relative aspect-[3/4] border rounded-lg overflow-hidden">
                              <Image
                                src={color.images[imgIndex]}
                                alt={`Color ${color.name} ${imgIndex === 0 ? "delantero" : "trasero"}`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="absolute top-1 left-1 h-7 w-7"
                                title="Recortar imagen"
                                onClick={() =>
                                  setCropTarget({
                                    colorIndex,
                                    imageIndex: imgIndex,
                                    src: color.images[imgIndex],
                                  })
                                }
                              >
                                <Crop className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => {
                                  setColors((prevColors) => {
                                    const newColors = [...prevColors];
                                    const newImages = [...newColors[colorIndex].images];
                                    newImages[imgIndex] = "";
                                    newColors[colorIndex].images = newImages;
                                    return newColors;
                                  });
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground text-center px-2">
                                Subir {imgIndex === 0 ? "delantero" : "trasero"}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => handleImageUpload(colorIndex, imgIndex, e)}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Tallas y stock por talla *</Label>
                      <Button type="button" onClick={() => addVariant(colorIndex)} variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Añadir talla
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {color.variants.map((variant, variantIndex) => (
                        <div key={variantIndex} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Talla</Label>
                            <select
                              value={variant.size}
                              onChange={(e) => updateVariant(colorIndex, variantIndex, "size", e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              {AVAILABLE_SIZES.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Stock</Label>
                            <Input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => updateVariant(colorIndex, variantIndex, "stock", e.target.value)}
                              min="0"
                              placeholder="0"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(colorIndex, variantIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {color.variants.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                          No hay tallas agregadas. Haz clic en "Añadir talla"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              className="bg-primary hover:bg-red-700"
              disabled={loading || uploading}
            >
              {uploading
                ? "SUBIENDO IMAGEN..."
                : loading
                ? "GUARDANDO..."
                : id
                ? "ACTUALIZAR PRODUCTO"
                : "CREAR PRODUCTO"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/adminmp/dashboard")}>
              CANCELAR
            </Button>
          </div>
        </form>
      </CardContent>

      {cropTarget && (
        <ImageCropper
          image={cropTarget.src}
          aspect={3 / 4}
          onCancel={() => setCropTarget(null)}
          onSave={applyCrop}
        />
      )}
    </Card>
  );
}
