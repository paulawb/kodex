import { api } from "./api.js";
import { garmentView } from "./garment.js";
import { buildWhatsAppUrl } from "./message.js";

const $ = (s) => document.querySelector(s);
const state = { products: [], settings: { whatsapp_number: "", currency: "COP", message_template: "{items}\n{total}", item_template: "{n}. {nombre} {color} {talla} x{cantidad}" }, cart: [], sel: null };
const money = (n) => "$" + n.toLocaleString("es-CO") + " " + state.settings.currency;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ---------- Rack ---------- */
function renderRack() {
  const items = $("#items");
  items.innerHTML = "";
  state.products.forEach((p, i) => {
    const el = document.createElement("button");
    el.className = "hanger";
    el.style.setProperty("--d", `${(i % 5) * -0.4}s`);
    el.innerHTML = `<span class="hook"></span>
      <span class="cloth">${garmentView(p, p.colors[0])}</span>
      <span class="mono ref">${esc(p.ref)}</span>
      <span class="hname">${esc(p.name)}</span>
      <span class="mono">${money(p.price)}</span>`;
    el.addEventListener("click", () => {
      el.classList.remove("swing");
      void el.offsetWidth;
      el.classList.add("swing");
      setTimeout(() => openViewer(p), 350);
    });
    items.append(el);
  });
}

// Navegación horizontal: arrastre con inercia suave
function enableDrag() {
  const w = document.querySelector(".rack-wrap");
  let down = false, sx = 0, sl = 0, moved = false;
  w.addEventListener("pointerdown", (e) => { down = true; moved = false; sx = e.clientX; sl = w.scrollLeft; });
  window.addEventListener("pointermove", (e) => {
    if (!down || e.pointerType === "touch") return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) moved = true;
    w.scrollLeft = sl - dx;
  });
  window.addEventListener("pointerup", () => (down = false));
  w.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  w.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { w.scrollBy({ left: e.deltaY, behavior: "smooth" }); e.preventDefault(); }
  }, { passive: false });
}

/* ---------- Viewer ---------- */
function paintGarment() {
  const { product, color } = state.sel;
  $("#faceFront").innerHTML = garmentView(product, color, "front");
  $("#faceBack").innerHTML = garmentView(product, color, "back");
  $("#vColorName").textContent = color.name;
  const hasBack = !!color.back_image;
  $("#btnBack").hidden = !hasBack;
  if (!hasBack && state.sel.side === "back") setSide("front");
}

function openViewer(p) {
  state.sel = { product: p, color: p.colors[0], size: p.sizes[0], side: "front" };
  $("#vRef").textContent = p.ref;
  $("#vName").textContent = p.name;
  $("#vPrice").textContent = money(p.price);
  $("#vDesc").textContent = p.description || "";
  $("#vColors").innerHTML = p.colors
    .map((c, i) => `<button class="sw ${i ? "" : "on"}" data-i="${i}" title="${esc(c.name)}" style="background:${esc(c.hex)}"></button>`)
    .join("");
  $("#vSizes").innerHTML = p.sizes
    .map((s, i) => `<button class="sz ${i ? "" : "on"}" data-s="${esc(s)}">${esc(s)}</button>`)
    .join("");
  setSide("front");
  paintGarment();
  $("#viewer").hidden = false;
}

function setSide(side) {
  state.sel.side = side;
  $("#flip").classList.toggle("flipped", side === "back");
  $("#btnFront").classList.toggle("on", side === "front");
  $("#btnBack").classList.toggle("on", side === "back");
}

/* ---------- Cart ---------- */
const saveCart = () => localStorage.setItem("kodex-cart", JSON.stringify(state.cart));

function renderCart() {
  $("#cartCount").textContent = state.cart.reduce((n, i) => n + i.qty, 0);
  $("#cartList").innerHTML = state.cart.length
    ? state.cart
        .map((i, idx) => `<li><div><b>${esc(i.name)}</b><br><span class="mono">${esc(i.ref)} · ${esc(i.color)} · ${esc(i.size)}</span></div>
          <div class="qty"><button data-d="-1" data-i="${idx}">−</button>${i.qty}<button data-d="1" data-i="${idx}">+</button></div></li>`)
        .join("")
    : `<li class="mono">La bolsa está vacía.</li>`;
  $("#cartTotal").textContent = money(state.cart.reduce((n, i) => n + i.price * i.qty, 0));
}

function addToCart() {
  const { product: p, color, size } = state.sel;
  const found = state.cart.find((i) => i.id === p.id && i.color === color.name && i.size === size);
  if (found) found.qty++;
  else state.cart.push({ id: p.id, ref: p.ref, name: p.name, price: p.price, description: p.description || "", color: color.name, size, qty: 1 });
  saveCart(); renderCart();
  $("#viewer").hidden = true;
  openDrawer(true);
}

function openDrawer(open) {
  $("#drawer").classList.toggle("open", open);
  $("#drawer").setAttribute("aria-hidden", String(!open));
}

/* ---------- Events ---------- */
function bind() {
  document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) {
      const t = close.dataset.close;
      t === "drawer" ? openDrawer(false) : ($("#" + t).hidden = true);
    }
    if (e.target.classList.contains("overlay")) e.target.hidden = true;
  });
  $("#cartBtn").onclick = () => openDrawer(true);
  $("#btnFront").onclick = () => setSide("front");
  $("#btnBack").onclick = () => setSide("back");
  $("#flip").onclick = () => state.sel.color.back_image && setSide(state.sel.side === "front" ? "back" : "front");
  $("#vColors").onclick = (e) => {
    const b = e.target.closest(".sw");
    if (!b) return;
    state.sel.color = state.sel.product.colors[+b.dataset.i];
    document.querySelectorAll(".sw").forEach((x) => x.classList.toggle("on", x === b));
    paintGarment();
  };
  $("#vSizes").onclick = (e) => {
    const b = e.target.closest(".sz");
    if (!b) return;
    state.sel.size = b.dataset.s;
    document.querySelectorAll(".sz").forEach((x) => x.classList.toggle("on", x === b));
  };
  $("#guideLink").onclick = (e) => { e.preventDefault(); $("#guide").hidden = false; };
  $("#addBtn").onclick = addToCart;
  $("#cartList").onclick = (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    const item = state.cart[+b.dataset.i];
    item.qty += +b.dataset.d;
    if (item.qty <= 0) state.cart.splice(+b.dataset.i, 1);
    saveCart(); renderCart();
  };
  $("#orderForm").onsubmit = (e) => {
    e.preventDefault();
    if (!state.cart.length) return;
    const f = new FormData(e.target);
    window.open(buildWhatsAppUrl({
      number: state.settings.whatsapp_number, template: state.settings.message_template, itemTemplate: state.settings.item_template,
      name: f.get("name").trim(), city: f.get("city").trim(), cart: state.cart, money,
    }), "_blank", "noopener");
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { document.querySelectorAll(".overlay").forEach((o) => (o.hidden = true)); openDrawer(false); }
  });
}

async function init() {
  try { state.cart = JSON.parse(localStorage.getItem("kodex-cart")) || []; } catch { state.cart = []; }
  bind(); enableDrag(); renderCart();
  $("#status").textContent = "CARGANDO…";
  try {
    [state.products, state.settings] = await Promise.all([api.products(), api.settings()]);
    $("#status").textContent = state.products.length ? "" : "SIN PRENDAS POR AHORA";
    const ids = new Set(state.products.map((p) => p.id));
    state.cart = state.cart.filter((i) => ids.has(i.id));
    saveCart();
    renderRack(); renderCart();
  } catch {
    $("#status").textContent = "NO SE PUDO CONECTAR CON EL SERVIDOR (puede estar despertando, recarga en 30s)";
  }
}
init();
