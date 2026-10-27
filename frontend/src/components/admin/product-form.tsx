"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { adminCreateProduct, adminUpdateProduct } from "@/lib/api";
import Image from "next/image";
import { Plus, Trash2, Upload, X } from "lucide-react";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    isFeatured: false,
  });

  const [colors, setColors] = useState<ColorForm[]>([
    {
      name: "",
      hex: "#000000",
      images: [],
      variants: [],
    },
  ]);

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        const pass = localStorage.getItem("kodex_admin_pass");
        if (!pass) {
          router.push("/admin/login");
          return;
        }
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/admin/products`,
            {
              headers: {
                "x-admin-password": pass,
              },
            }
          );
          if (res.ok) {
            const products = await res.json();
            const product = products.find((p: any) => p.id === id);
            if (product) {
              setFormData({
                name: product.name || "",
                description: product.description || "",
                price: product.price || 0,
                category: product.category || "",
                isFeatured: product.isFeatured || false,
              });
              if (product.colors && product.colors.length > 0) {
                setColors(
                  product.colors.map((color: any) => ({
                    id: color.id,
                    name: color.name || "",
                    hex: color.hex || "#000000",
                    images: color.images || [],
                    variants: (color.variants || []).map((v: any) => ({
                      size: v.size,
                      stock: v.stock || 0,
                    })),
                  }))
                );
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      loadProduct();
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: type === "number" ? Number(value) : value });
    }
  };

  const addColor = () => {
    setColors([
      ...colors,
      {
        name: "",
        hex: "#000000",
        images: [],
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

  const handleImageUpload = (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        alert("Solo se permiten archivos JPG, JPEG o PNG");
        return;
      }
      if (file.size > maxSize) {
        alert("Cada imagen no debe superar los 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setColors((prevColors) => {
          const newColors = [...prevColors];
          newColors[colorIndex].images.push(result);
          return newColors;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (colorIndex: number, imageIndex: number) => {
    setColors((prevColors) => {
      const newColors = [...prevColors];
      newColors[colorIndex].images = newColors[colorIndex].images.filter((_, i) => i !== imageIndex);
      return newColors;
    });
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
    const pass = localStorage.getItem("kodex_admin_pass");
    if (!pass) {
      router.push("/admin/login");
      return;
    }

    for (let i = 0; i < colors.length; i++) {
      if (!colors[i].name.trim()) {
        alert(`Debes ingresar el nombre del color ${i + 1}`);
        return;
      }
      if (colors[i].images.length === 0) {
        alert(`Debes subir al menos una imagen para el color "${colors[i].name}"`);
        return;
      }
      if (colors[i].variants.length === 0) {
        alert(`Debes agregar al menos una talla con stock para el color "${colors[i].name}"`);
        return;
      }
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        colors: colors.map((color) => ({
          name: color.name,
          hex: color.hex,
          images: color.images,
          variants: color.variants.filter((v) => v.size && v.stock >= 0),
        })),
      };

      if (id) {
        await adminUpdateProduct(pass, id, data);
      } else {
        await adminCreateProduct(pass, data);
      }
      router.push("/admin/dashboard");
    } catch (error) {
      alert("Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
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
                    <Label>Fotos de este color * (JPG, JPEG, PNG)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {color.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="relative aspect-square border rounded-lg overflow-hidden">
                          <Image src={img} alt={`Color ${color.name} ${imgIndex + 1}`} fill className="object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(colorIndex, imgIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground text-center px-2">Subir foto</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png"
                          multiple
                          onChange={(e) => handleImageUpload(colorIndex, e)}
                        />
                      </label>
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

          <div className="flex gap-4">
            <Button type="submit" className="bg-primary hover:bg-red-700" disabled={loading}>
              {loading ? "GUARDANDO..." : id ? "ACTUALIZAR PRODUCTO" : "CREAR PRODUCTO"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard")}>
              CANCELAR
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
