"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Ingresa la contraseña");
      return;
    }
    localStorage.setItem("kodex_admin_pass", password);
    router.push("/admin/dashboard");
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
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-red-700">
              INGRESAR
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
