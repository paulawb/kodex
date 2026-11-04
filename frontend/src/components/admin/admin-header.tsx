"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearAdminPass } from "@/lib/admin-auth";
import { LogOut, Package, Image, Store } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/adminmp/login") return null;

  const handleLogout = () => {
    clearAdminPass();
    router.push("/adminmp/login");
  };

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      pathname === href || pathname.startsWith(`${href}/`)
        ? "bg-white text-black"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/adminmp/dashboard" className="text-xl font-bold tracking-tighter text-white">
          KØ<span className="text-primary">DEX</span>
          <span className="ml-2 text-xs font-normal uppercase tracking-widest text-white/50">Admin</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/adminmp/dashboard" className={linkClass("/adminmp/dashboard")}>
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Productos</span>
          </Link>
          <Link href="/adminmp/dashboard/apariencia" className={linkClass("/adminmp/dashboard/apariencia")}>
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Apariencia</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Ver tienda</span>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
