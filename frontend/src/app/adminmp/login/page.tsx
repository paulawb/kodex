"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminPing } from "@/lib/api";
import { setAdminPass } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [slow, setSlow] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Ingresa la contraseña");
      return;
    }

    setChecking(true);
    setError("");
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 6000);

    try {
      const ok = await adminPing(password);
      if (!ok) {
        setError("Contraseña incorrecta");
        return;
      }
      setAdminPass(password);
      router.push("/adminmp/dashboard");
    } catch (err: any) {
      setError(err?.message || "No se pudo conectar con el servidor.");
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
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
            {checking && slow && (
              <p className="text-sm text-muted-foreground">
                El servidor está iniciando (puede tardar hasta 1 minuto). Espera un momento…
              </p>
            )}
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
