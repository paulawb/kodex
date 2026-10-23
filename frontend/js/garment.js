import { API_URL } from "./config.js";

// Solo fotos reales: si no hay foto, no se muestra nada.
export function photoUrl(url) {
  if (!url) return "";
  return /^https?:/.test(url) ? url : API_URL + url;
}

export function garmentView(product, color, side = "front") {
  const src = photoUrl(color[side === "front" ? "front_image" : "back_image"]);
  if (!src) return "";
  return `<img class="photo" src="${src.replace(/"/g, "&quot;")}" alt="${product.name.replace(/"/g, "&quot;")} ${side}" loading="lazy">`;
}
