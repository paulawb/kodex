// Variables del mensaje: {nombre} {ciudad} {items} {total}
// Variables de cada prenda: {n} {nombre} {ref} {descripcion} {color} {talla} {cantidad} {subtotal}
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

export function formatItems(cart, itemTemplate, money) {
  return cart
    .map((i, idx) =>
      fill(itemTemplate, {
        n: idx + 1, nombre: i.name, ref: i.ref, descripcion: i.description || "", color: i.color,
        talla: i.size, cantidad: i.qty, subtotal: money(i.price * i.qty),
      }).replace(/ {2,}/g, " ").replace(/ +\n/g, "\n").trim()
    )
    .join("\n");
}

export function renderMessage(template, vars) {
  return fill(template, vars);
}

export function buildWhatsAppUrl({ number, template, itemTemplate, name, city, cart, money }) {
  const total = cart.reduce((n, i) => n + i.price * i.qty, 0);
  const text = renderMessage(template, {
    nombre: name, ciudad: city, items: formatItems(cart, itemTemplate, money), total: money(total),
  });
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
