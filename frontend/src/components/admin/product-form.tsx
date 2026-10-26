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
import { Upload, X } from "lucide-react";

interface ProductFormProps {
  id: string | null;
}

export function ProductForm({ id }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    images: [] as string[],
    category: "",
    sizes: "",
    stock: 0,
    isFeatured: false,
  });

  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string>("");

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
                images: product.images || [],
                category: product.category || "",
                sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
                stock: product.stock || 0,
                isFeatured: product.isFeatured || false,
              });
              if (product.images && product.images[0]) {
                setFrontImage(product.images[0]);
              }
              if (product.images && product.images[1]) {
                setBackImage(product.images[1]);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten archivos JPG, JPEG o PNG");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("La imagen no debe superar los 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === "front") {
        setFrontImage(result);
      } else {
        setBackImage(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (type: "front" | "back") => {
    if (type === "front") {
      setFrontImage("");
    } else {
      setBackImage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = localStorage.getItem("kodex_admin_pass");
    if (!pass) {
      router.push("/admin/login");
      return;
    }

    if (!frontImage) {
      alert("Debes subir al menos la foto frontal de la camisa");
      return;
    }

    setLoading(true);
    try {
      const images: string[] = [];
      if (frontImage) images.push(frontImage);
      if (backImage) images.push(backImage);

      const data = {
        ...formData,
        images: images,
        sizes: formData.sizes
          .split(",")
          .map((size) => size.trim().toUpperCase())
          .filter(Boolean),
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
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
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
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizes">Tallas (separadas por coma)</Label>
              <Input
                id="sizes"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                placeholder="S, M, L, XL"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Fotos del producto *</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Sube la foto frontal y trasera en formato JPG, JPEG o PNG (máximo 5MB cada una)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foto Frontal */}
              <div className="space-y-2">
                <Label htmlFor="frontImage">Foto frontal *</Label>
                {frontImage ? (
                  <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={frontImage}
                      alt="Vista frontal"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage("front")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="frontImage"
                    className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground text-center px-4">
                        <span className="font-semibold">Click para subir</span>
                      </p>
                      <p className="text-xs text-muted-foreground">JPG, JPEG, PNG</p>
                    </div>
                    <input
                      id="frontImage"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleImageUpload(e, "front")}
                    />
                  </label>
                )}
              </div>

              {/* Foto Trasera */}
              <div className="space-y-2">
                <Label htmlFor="backImage">Foto trasera (opcional)</Label>
                {backImage ? (
                  <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={backImage}
                      alt="Vista trasera"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage("back")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="backImage"
                    className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground text-center px-4">
                        <span className="font-semibold">Click para subir</span>
                      </p>
                      <p className="text-xs text-muted-foreground">JPG, JPEG, PNG</p>
                    </div>
                    <input
                      id="backImage"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleImageUpload(e, "back")}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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

          <div className="flex gap-4">
            <Button type="submit" className="bg-primary hover:bg-red-700" disabled={loading}>
              {loading ? "GUARDANDO..." : id ? "ACTUALIZAR" : "CREAR PRODUCTO"}
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
