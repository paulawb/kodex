"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { adminGetSiteSettings, adminUpdateSiteSettings, SiteSettings } from "@/lib/api";
import { ImagePlus, Trash2, Save, ArrowLeft } from "lucide-react";

const MAX_FILE_MB = 10;
const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

async function fileToDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

  // Si la imagen es muy pesada, la optimizamos antes de guardarla.
  if (file.size <= 2 * 1024 * 1024) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxWidth = 2200;
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const SLOTS: { key: keyof SiteSettings; title: string; description: string; ratio: string }[] = [
  {
    key: "banner",
    title: "Banner principal",
    description: "Imagen grande del inicio. Horizontal (ej. 1920 x 900).",
    ratio: "aspect-[16/7]",
  },
  {
    key: "lookbook1",
    title: "Lookbook 1 — URBAN",
    description: "Primera imagen del lookbook. Cuadrada (ej. 1200 x 1200).",
    ratio: "aspect-square",
  },
  {
    key: "lookbook2",
    title: "Lookbook 2 — ATTITUDE",
    description: "Segunda imagen del lookbook. Cuadrada (ej. 1200 x 1200).",
    ratio: "aspect-square",
  },
];

export default function AppearancePage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<SiteSettings>({
    banner: null,
    lookbook1: null,
    lookbook2: null,
  });

  useEffect(() => {
    const pass = localStorage.getItem("kodex_admin_pass");
    if (!pass) {
      router.push("/adminmp/login");
      return;
    }
    setIsAuth(true);
    adminGetSiteSettings(pass)
      .then((data) => setSettings(data))
      .catch(() => setMessage("No se pudo cargar la apariencia"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleFile = async (key: keyof SiteSettings, file: File) => {
    if (!VALID_TYPES.includes(file.type)) {
      alert("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`La imagen no debe superar ${MAX_FILE_MB} MB`);
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setSettings((prev) => ({ ...prev, [key]: dataUrl }));
    setMessage("");
  };

  const handleRemove = (key: keyof SiteSettings) => {
    setSettings((prev) => ({ ...prev, [key]: null }));
    setMessage("");
  };

  const handleSave = async () => {
    const pass = localStorage.getItem("kodex_admin_pass");
    if (!pass) {
      router.push("/adminmp/login");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const saved = await adminUpdateSiteSettings(pass, {
        banner: settings.banner,
        lookbook1: settings.lookbook1,
        lookbook2: settings.lookbook2,
      });
      setSettings(saved);
      setMessage("Cambios guardados. Ya se ven en la tienda.");
    } catch (error: any) {
      setMessage(error?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuth) return null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-10 space-y-2">
        <Button variant="ghost" className="px-0" onClick={() => router.push("/adminmp/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al panel
        </Button>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">APARIENCIA</h1>
        <p className="text-lg text-muted-foreground">
          Cambia el banner y las imágenes del lookbook sin tocar archivos
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {SLOTS.map((slot) => (
            <Card key={slot.key}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label className="text-base">{slot.title}</Label>
                    <p className="text-sm text-muted-foreground">{slot.description}</p>
                  </div>
                  {settings[slot.key] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(slot.key)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Quitar
                    </Button>
                  )}
                </div>

                {settings[slot.key] ? (
                  <div className={`relative ${slot.ratio} w-full overflow-hidden rounded-md border bg-accent`}>
                    <img
                      src={settings[slot.key] as string}
                      alt={slot.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Sin imagen personalizada (se usa la de por defecto).
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-3 text-sm hover:bg-muted/50">
                  <ImagePlus className="h-4 w-4" />
                  Subir imagen
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(slot.key, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-primary hover:bg-red-700"
            >
              <Save className="mr-2 h-5 w-5" />
              {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
