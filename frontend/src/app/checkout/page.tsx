import { WhatsAppCheckout } from "@/components/checkout/whatsapp-checkout";

export const metadata = {
  title: "Finalizar compra | KØDEX",
  description: "Completa tu pedido por WhatsApp",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          FINALIZAR COMPRA
        </h1>
        <p className="text-lg text-muted-foreground">
          Tu pedido será enviado por WhatsApp con todos los detalles
        </p>
      </div>
      <WhatsAppCheckout />
    </div>
  );
}
