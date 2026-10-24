import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-primary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
              KØ<span className="text-primary">DEX</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl font-light tracking-wide">
              STREETWEAR SIN REGLAS
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Colección urbana, limitada y con actitud. Para los que escriben sus propias reglas.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-red-700 text-lg px-8">
              <Link href="/tienda">
                VER COLECCIÓN
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 border-white hover:bg-white hover:text-black">
              <Link href="/tienda">EXPLORAR</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
