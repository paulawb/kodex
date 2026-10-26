import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tighter">
                KØ<span className="text-primary">DEX</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Streetwear sin reglas. Colección urbana con actitud.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">NAVEGACIÓN</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Tienda
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">INFORMACIÓN</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">SÍGUENOS</h3>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/kodex.store?mdxt=MWxrNmRidGo4MHlhag=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.facebook.com/share/1C3GPvHKT2/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} KØDEX. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

