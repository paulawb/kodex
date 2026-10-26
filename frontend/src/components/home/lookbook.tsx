import { lookbookItems } from "@/config/lookbook";

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
          {lookbookItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-[4/5] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <p className="text-2xl font-bold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
