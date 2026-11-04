"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminGetProducts } from "@/lib/api";
import { setAdminPass } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Ingresa la contraseña");
      return;
    }

    setChecking(true);
    setError("");
    try {
      // Validamos la contraseña contra el servidor antes de dejar entrar.
      await adminGetProducts(password);
      setAdminPass(password);
      router.push("/adminmp/dashboard");
    } catch (err: any) {
      const message = String(err?.message || "");
      setError(
        message.includes("No autorizado") || message.includes("401")
          ? "Contraseña incorrecta"
          : "No se pudo conectar con el servidor. Intenta de nuevo."
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-32 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ADMIN KØDEX</CardTitle>
          <p className="text-sm text-muted-foreground">Panel de administración</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-red-700"
              disabled={checking}
            >
              {checking ? "VERIFICANDO..." : "INGRESAR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
