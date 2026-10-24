"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { MessageCircle } from "lucide-react";

export function WhatsAppCheckout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      router.push("/tienda");
      return;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
    
    let message = `*PEDIDO KØDEX*\n\n`;
    message += `*PRODUCTOS:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Talla: ${item.size}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio unitario: $${item.price.toLocaleString("es-CO")}\n`;
      message += `   Subtotal: $${(item.price * item.quantity).toLocaleString("es-CO")}\n\n`;
    });
    
    message += `*TOTAL: $${getTotalPrice().toLocaleString("es-CO")}*\n\n`;
    message += `*DATOS DEL CLIENTE:*\n`;
    message += `Nombre: ${formData.name}\n`;
    message += `Teléfono: ${formData.phone}\n`;
    message += `Dirección de entrega: ${formData.address}\n`;
    if (formData.note) {
      message += `Nota: ${formData.note}\n`;
    }
    message += `\nEnviado desde kodex.com`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    clearCart();
    window.open(whatsappUrl, "_blank");
    router.push("/tienda");
  };

  if (items.length === 0) {
    router.push("/tienda");
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>DATOS DE ENTREGA</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección de entrega *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Nota adicional (opcional)</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={2}
                placeholder="Color, referencia, etc."
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              ENVIAR PEDIDO POR WHATSAPP
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RESUMEN DEL PEDIDO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4 pb-4 border-b border-border">
              <div className="w-20 h-20 bg-accent overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground">Talla: {item.size} | Cant: {item.quantity}</p>
                <p className="font-semibold">${(item.price * item.quantity).toLocaleString("es-CO")}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-lg font-bold pt-4">
            <span>TOTAL</span>
            <span>${getTotalPrice().toLocaleString("es-CO")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
