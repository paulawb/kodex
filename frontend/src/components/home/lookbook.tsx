export function Lookbook() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
            LOOK<span className="text-primary">BOOK</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Actitud. Identidad. Sin reglas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-[4/5] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1000&fit=crop"
              alt="KØDEX lookbook 1"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <p className="text-2xl font-bold">URBAN</p>
              <p className="text-sm text-muted-foreground">SIN CONCESIONES</p>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=1000&fit=crop"
              alt="KØDEX lookbook 2"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <p className="text-2xl font-bold">ATTITUDE</p>
              <p className="text-sm text-muted-foreground">ESCRIBE TU REGLA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
