"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { adminCreateProduct, adminUpdateProduct, getProductBySlug } from "@/lib/api";
import { Product } from "@/types/product";

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
    images: "",
    category: "",
    sizes: "",
    stock: 0,
    isFeatured: false,
  });

  useEffect(() => {
    if (id) {
      // For simplicity, we'll need to fetch by getting all products - but easier to just load
      const load = async () => {
        const pass = localStorage.getItem("kodex_admin_pass");
        // This is simplified - in production would need get by id
      };
      load();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: type === "number" ? Number(value) : value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = localStorage.getItem("kodex_admin_pass");
    if (!pass) {
      router.push("/admin/login");
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        images: formData.images.split(",").map((img) => img.trim()).filter(Boolean),
        sizes: formData.sizes.split(",").map((size) => size.trim()).filter(Boolean),
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

          <div className="space-y-2">
            <Label htmlFor="images">Imágenes (URLs separadas por coma) *</Label>
            <Textarea
              id="images"
              name="images"
              value={formData.images}
              onChange={handleChange}
              rows={3}
              placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
              required
            />
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
