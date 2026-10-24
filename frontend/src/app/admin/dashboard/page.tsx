"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductManager } from "@/components/admin/product-manager";
import { Plus } from "lucide-react";

export default function AdminDashboardPage() {
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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">PANEL ADMIN</h1>
          <p className="text-lg text-muted-foreground">Gestión de productos KØDEX</p>
        </div>
        <Button
          onClick={() => router.push("/admin/dashboard/producto/nuevo")}
          className="bg-primary hover:bg-red-700"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          NUEVO PRODUCTO
        </Button>
      </div>
      <ProductManager />
    </div>
  );
}
