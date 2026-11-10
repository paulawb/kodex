/**
 * Sube una imagen a Vercel Blob y devuelve su URL pública.
 * Las fotos así NO se guardan en la base de datos y no consumen su transferencia.
 * Si Vercel Blob no está configurado, devuelve el data URL (se guarda en la base).
 */
export async function uploadImage(dataUrl: string): Promise<string> {
  // Si ya es una URL (imagen existente), no hay nada que subir.
  if (/^https?:\/\//i.test(dataUrl)) return dataUrl;

  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("file", blob, "imagen.jpg");

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    let message = "No se pudo subir la imagen";
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {}

    // Respaldo: sin Blob configurado, la imagen se guarda en la base de datos.
    if (message.includes("BLOB_READ_WRITE_TOKEN")) return dataUrl;

    throw new Error(message);
  }

  const json = await res.json();
  return json.url as string;
}
