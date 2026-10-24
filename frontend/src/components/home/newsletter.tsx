"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 to-black">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
              ÚNETE AL <span className="text-primary">MOVIMIENTO</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Suscríbete y sé el primero en conocer lanzamientos exclusivos
            </p>
          </div>

          {submitted ? (
            <p className="text-primary font-semibold">¡Gracias por suscribirte!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="bg-primary hover:bg-red-700">
                SUSCRIBIRSE
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
