// Plantilla del mensaje de WhatsApp. Variables: {nombre} {ciudad} {items} {total}
export function renderMessage(template, vars) {
  return template.replace(/\{(nombre|ciudad|items|total)\}/g, (_, k) => vars[k]);
}

export function formatItems(cart, money) {
  return cart
    .map((i, n) => `${n + 1}. ${i.ref} ${i.name} | Color: ${i.color} | Talla: ${i.size} | x${i.qty} | ${money(i.price * i.qty)}`)
    .join("\n");
}

export function buildWhatsAppUrl({ number, template, name, city, cart, money }) {
  const total = cart.reduce((n, i) => n + i.price * i.qty, 0);
  const text = renderMessage(template, { nombre: name, ciudad: city, items: formatItems(cart, money), total: money(total) });
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
