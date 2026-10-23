// Generadores SVG de prendas + gráficos tribales (vectoriales).
const SHAPES = {
  tee: "M70 20 L100 34 Q150 52 200 34 L230 20 L286 62 L258 104 L232 90 L232 300 L68 300 L68 90 L42 104 L14 62 Z",
  hoodie:
    "M62 40 Q150 -4 238 40 L286 70 L282 250 L246 250 L242 300 L58 300 L54 250 L18 250 L14 70 Z",
  cap: "M40 190 Q40 60 150 60 Q260 60 260 190 L290 205 Q150 225 10 205 Z",
};

function graphic(kind, ink) {
  const s = `stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if (kind === "fang")
    return `<g ${s}><path d="M110 130 Q150 110 190 130 L170 215 L150 250 L130 215 Z"/>
      <path d="M130 130 L150 190 L170 130"/><path d="M90 120 L110 170 M210 120 L190 170"/>
      <circle cx="150" cy="95" r="6" fill="${ink}"/></g>`;
  if (kind === "eye")
    return `<g ${s}><path d="M85 170 Q150 100 215 170 Q150 240 85 170Z"/>
      <circle cx="150" cy="170" r="24"/><circle cx="150" cy="170" r="8" fill="${ink}"/>
      <path d="M150 85 V110 M105 100 L117 122 M195 100 L183 122 M150 255 V235"/></g>`;
  return `<g ${s}><circle cx="150" cy="170" r="55"/><circle cx="150" cy="170" r="30"/>
    <path d="M150 90 L165 135 L150 150 L135 135 Z M150 250 L135 205 L150 190 L165 205 Z
    M70 170 L115 155 L130 170 L115 185 Z M230 170 L185 185 L170 170 L185 155 Z"/>
    <circle cx="150" cy="170" r="6" fill="${ink}"/></g>`;
}

export function garmentSVG(product, color, side = "front") {
  const { hex, ink } = color;
  const body = SHAPES[product.type] || SHAPES.tee;
  const art =
    side === "front"
      ? `<g transform="${product.type === "cap" ? "translate(0 -30) scale(1)" : ""}">${graphic(product.graphic, ink)}</g>`
      : `<text x="150" y="130" text-anchor="middle" font-family="Cinzel,serif" font-weight="900"
          font-size="34" fill="${ink}" letter-spacing="4">KØDEX</text>
         <g transform="translate(150 215) scale(.5) translate(-150 -170)">${graphic(product.graphic, ink)}</g>`;
  const hood =
    product.type === "hoodie" && side === "front"
      ? `<path d="M110 36 Q150 80 190 36" fill="none" stroke="${ink}" stroke-opacity=".5" stroke-width="2"/>
         <path d="M110 250 H190 L196 290 H104 Z" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="2"/>`
      : "";
  return `<svg viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${product.name}">
    <path d="${body}" fill="${hex}" stroke="rgba(0,0,0,.45)" stroke-width="2"/>
    ${hood}${art}</svg>`;
}
