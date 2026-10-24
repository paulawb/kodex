"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

export default function ProductFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const pass = localStorage.getItem("kodex_admin_pass");
    if (!pass) {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return null;

  const isNew = id === "nuevo";

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12 space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          {isNew ? "CREAR PRODUCTO" : "EDITAR PRODUCTO"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isNew ? "Añade un nuevo producto a la tienda" : "Modifica los datos del producto"}
        </p>
      </div>
      <ProductForm id={isNew ? null : id} />
    </div>
  );
}
