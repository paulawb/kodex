import { api } from "./api.js";
import { API_URL } from "./config.js";
import { renderMessage } from "./message.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
let token = sessionStorage.getItem("kodex-token");
let products = [];
let editingId = null;

function photoField(side, label, url) {
  return `<label class="upl" data-side="${side}">${label}
    <img ${url ? `src="${/^https?:/.test(url) ? "" : API_URL}${esc(url)}"` : "hidden"} alt="">
    <input type="file" accept="image/png,image/jpeg" class="file">
    <button type="button" class="btn clr" ${url ? "" : "hidden"}>Quitar</button></label>`;
}

function colorRow(c = { name: "", hex: "#080808", ink: "#d60e0e" }) {
  const d = document.createElement("div");
  d.className = "row color-row";
  d.dataset.front = c.front_image || "";
  d.dataset.back = c.back_image || "";
  d.innerHTML = `<input class="cn" placeholder="Nombre (Pitch Black)" value="${esc(c.name)}" required>
    <input class="ch" type="color" value="${c.hex}"><input class="ci" type="color" value="${c.ink}">
    ${photoField("front", "Foto FRONT", c.front_image)}${photoField("back", "Foto BACK", c.back_image)}
    <button type="button" class="btn fit rm">×</button>`;
  d.querySelector(".rm").onclick = () => d.remove();
  d.querySelectorAll(".upl").forEach((box) => {
    const side = box.dataset.side, img = box.querySelector("img"), clr = box.querySelector(".clr");
    box.querySelector(".file").onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const url = await api.upload(token, f);
        d.dataset[side] = url;
        img.src = API_URL + url; img.hidden = false; clr.hidden = false;
        $("#err").textContent = "";
      } catch (er) { fail(er); }
      e.target.value = "";
    };
    clr.onclick = () => { d.dataset[side] = ""; img.hidden = true; clr.hidden = true; };
  });
  $("#colors").append(d);
}

function resetForm() {
  editingId = null;
  $("#pform").reset();
  $("#colors").innerHTML = "";
  colorRow();
  $("#formTitle").textContent = "Nueva prenda";
  $("#cancel").hidden = true;
}

function show(authed) {
  $("#loginView").hidden = authed;
  $("#appView").hidden = !authed;
}

function fail(e) {
  if (e.status === 401) { token = null; sessionStorage.removeItem("kodex-token"); show(false); }
  $("#err").textContent = e.message;
}

async function load() {
  try {
    [products] = await Promise.all([api.adminProducts(token)]);
    const s = await api.settings();
    $("#sform").whatsapp_number.value = s.whatsapp_number;
    $("#sform").currency.value = s.currency;
    $("#sform").message_template.value = s.message_template;
    updatePreview();
    $("#err").textContent = "";
    renderList();
  } catch (e) { fail(e); }
}

function renderList() {
  $("#list").innerHTML = products.length
    ? products.map((p) => `<div class="plist"><div><b>${esc(p.ref)} · ${esc(p.name)}</b> ${p.active ? "" : "(oculta)"}<br>
      <span class="mono">$${p.price.toLocaleString("es-CO")} · ${p.sizes.map(esc).join("/")} · ${p.colors.map((c) => esc(c.name)).join(", ")}</span></div>
      <div class="row" style="flex:0 0 auto"><button class="btn fit" data-e="${p.id}">EDITAR</button><button class="btn fit" data-d="${p.id}">BORRAR</button></div></div>`).join("")
    : "<p class='mono'>Sin prendas.</p>";
}

$("#list").onclick = async (e) => {
  const ed = e.target.dataset.e, del = e.target.dataset.d;
  if (ed) {
    const p = products.find((x) => x.id == ed);
    editingId = p.id;
    const f = $("#pform");
    f.ref.value = p.ref; f.name.value = p.name; f.price.value = p.price;
    f.type.value = p.type; f.graphic.value = p.graphic; f.sizes.value = p.sizes.join(",");
    f.active.checked = p.active;
    $("#colors").innerHTML = "";
    p.colors.forEach(colorRow);
    $("#formTitle").textContent = "Editar " + p.ref;
    $("#cancel").hidden = false;
    f.scrollIntoView({ behavior: "smooth" });
  }
  if (del && confirm("¿Borrar esta prenda?")) {
    try { await api.deleteProduct(token, del); await load(); } catch (er) { fail(er); }
  }
};

$("#pform").onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const body = {
    ref: f.ref.value.trim(), name: f.name.value.trim(), price: parseInt(f.price.value, 10),
    type: f.type.value, graphic: f.graphic.value, active: f.active.checked,
    sizes: f.sizes.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
    colors: [...document.querySelectorAll(".color-row")].map((r) => ({
      name: r.querySelector(".cn").value.trim(), hex: r.querySelector(".ch").value, ink: r.querySelector(".ci").value,
      front_image: r.dataset.front || null, back_image: r.dataset.back || null,
    })),
  };
  try {
    editingId ? await api.updateProduct(token, editingId, body) : await api.createProduct(token, body);
    resetForm(); await load();
  } catch (er) { fail(er); }
};

$("#sform").onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api.updateSettings(token, { whatsapp_number: e.target.whatsapp_number.value.trim(), currency: e.target.currency.value.trim() || "COP", message_template: e.target.message_template.value });
    $("#err").textContent = "";
    alert("Guardado");
  } catch (er) { fail(er); }
};

function updatePreview() {
  $("#preview").textContent = renderMessage($("#sform").message_template.value, {
    nombre: "Ana", ciudad: "Cali", items: "1. KDX-001 Sigil Tee | Color: Pitch Black | Talla: M | x1 | $129.000", total: "$129.000",
  });
}
$("#sform").message_template.oninput = updatePreview;
$("#addColor").onclick = () => colorRow();
$("#cancel").onclick = resetForm;
$("#logout").onclick = () => { sessionStorage.removeItem("kodex-token"); token = null; show(false); };
$("#loginBtn").onclick = async () => {
  try {
    token = (await api.login($("#pw").value)).token;
    sessionStorage.setItem("kodex-token", token);
    $("#loginErr").textContent = "";
    show(true); resetForm(); load();
  } catch (e) { $("#loginErr").textContent = e.message; }
};

resetForm();
if (token) { show(true); load(); } else show(false);
