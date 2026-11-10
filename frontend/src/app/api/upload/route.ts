import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Sube una imagen a Vercel Blob y devuelve su URL pública.
 * Así las fotos NO se guardan en la base de datos y no consumen su transferencia.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Falta configurar BLOB_READ_WRITE_TOKEN en Vercel" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen supera 4 MB" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-60) || "imagen.jpg";

    const blob = await put(`kodex/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "image/jpeg",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
