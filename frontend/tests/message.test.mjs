import assert from "node:assert/strict";
import test from "node:test";
import { buildWhatsAppUrl, formatItems, renderMessage } from "../js/message.js";

const money = (n) => "$" + n;
const cart = [
  { ref: "KDX-1", name: "Sigil Tee", description: "Oversize", price: 100, color: "Negro", size: "M", qty: 2 },
  { ref: "KDX-2", name: "Hoodie", description: "", price: 50, color: "Rojo", size: "L", qty: 1 },
];

test("reemplaza variables del mensaje", () => {
  assert.equal(renderMessage("{nombre}/{ciudad}/{items}/{total}", { nombre: "A", ciudad: "B", items: "C", total: "D" }), "A/B/C/D");
});

test("no re-interpreta variables dentro de datos del usuario", () => {
  assert.equal(renderMessage("{nombre} {total}", { nombre: "{total}", ciudad: "", items: "", total: "9" }), "{total} 9");
});

test("cada prenda se describe con nombre, descripción, color, talla, cantidad y subtotal", () => {
  const out = formatItems(cart, "{n}. {nombre} {descripcion} | {color} | {talla} | x{cantidad} | {subtotal}", money);
  assert.equal(out, "1. Sigil Tee Oversize | Negro | M | x2 | $200\n2. Hoodie | Rojo | L | x1 | $50");
});

test("mensaje completo con saludo, prendas y total", () => {
  const url = buildWhatsAppUrl({
    number: "573001112233", name: "Ana", city: "Cali", cart, money,
    template: "Hola, soy {nombre} de {ciudad}:\n{items}\nTotal: {total}",
    itemTemplate: "{n}. {nombre} - {color} - {talla} x{cantidad}",
  });
  assert.ok(url.startsWith("https://wa.me/573001112233?text="));
  assert.equal(decodeURIComponent(url.split("text=")[1]),
    "Hola, soy Ana de Cali:\n1. Sigil Tee - Negro - M x2\n2. Hoodie - Rojo - L x1\nTotal: $250");
});
