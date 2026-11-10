"use client";

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Check, X, ZoomIn } from "lucide-react";

interface ImageCropperProps {
  image: string;
  /** Proporción del recorte: 3/4 = vertical (ropa). */
  aspect?: number;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

async function cropImage(src: string, area: Area, maxWidth = 800): Promise<string> {
  const image = await loadImage(src);
  const scale = Math.min(1, maxWidth / area.width);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return src;

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Calidad moderada: la foto se ve bien y pesa ~5 veces menos.
  return canvas.toDataURL("image/jpeg", 0.78);
}

export function ImageCropper({
  image,
  aspect = 3 / 4,
  onCancel,
  onSave,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!area) return;
    setSaving(true);
    try {
      const result = await cropImage(image, area);
      onSave(result);
    } catch {
      alert("No se pudo recortar la imagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold uppercase tracking-wider">Recortar imagen</p>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative flex-1">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
        />
      </div>

      <div className="space-y-4 border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-red-600"
            aria-label="Zoom"
          />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            CANCELAR
          </Button>
          <Button
            type="button"
            className="flex-1 bg-primary hover:bg-red-700"
            onClick={handleSave}
            disabled={saving || !area}
          >
            <Check className="mr-2 h-4 w-4" />
            {saving ? "GUARDANDO..." : "USAR ESTA FOTO"}
          </Button>
        </div>
      </div>
    </div>
  );
}
