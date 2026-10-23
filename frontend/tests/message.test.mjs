import assert from "node:assert/strict";
import test from "node:test";
import { buildWhatsAppUrl, renderMessage } from "../js/message.js";

const money = (n) => "$" + n;
const cart = [{ ref: "KDX-1", name: "Tee", price: 100, color: "Pitch Black", size: "M", qty: 2 }];

test("reemplaza variables", () => {
  assert.equal(renderMessage("{nombre}/{ciudad}/{items}/{total}", { nombre: "A", ciudad: "B", items: "C", total: "D" }), "A/B/C/D");
});

test("no re-interpreta variables dentro de datos del usuario", () => {
  assert.equal(renderMessage("{nombre} {total}", { nombre: "{total}", ciudad: "", items: "", total: "9" }), "{total} 9");
});

test("plantilla personalizada y enlace wa.me", () => {
  const url = buildWhatsAppUrl({ number: "573001112233", template: "Hola, soy {nombre} ({ciudad})\n{items}\nTotal {total}", name: "Ana", city: "Cali", cart, money });
  assert.ok(url.startsWith("https://wa.me/573001112233?text="));
  const text = decodeURIComponent(url.split("text=")[1]);
  assert.equal(text, "Hola, soy Ana (Cali)\n1. KDX-1 Tee | Color: Pitch Black | Talla: M | x2 | $200\nTotal $200");
});
