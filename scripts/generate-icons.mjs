// Gera os ícones do app (PWA, Apple, favicon) a partir do símbolo da marca.
// Uso: node scripts/generate-icons.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public/icons");
fs.mkdirSync(out, { recursive: true });

const NAVY = "#0B1220";
const SAND = "#F8F5EF";

// Símbolo (mesmo desenho de src/components/brand/logo.tsx), em 64x48.
const mark = (_fg, cut) => `
  <defs><linearGradient id="o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0dfb8"/><stop offset="1" stop-color="#c9a66b"/></linearGradient></defs>
  <g fill="none" stroke-linecap="round" stroke="url(#o)">
    <g stroke-width="2"><path d="M14 15.5l3.2 2.4"/><path d="M50 15.5l-3.2 2.4"/><path d="M20.5 8.5l2 3"/><path d="M43.5 8.5l-2 3"/><path d="M8.5 24h4"/><path d="M55.5 24h-4"/></g>
    <path d="M32 3v18M26.5 8.5h11" stroke-width="2.6"/>
  </g>
  <path d="M20 31a12 9 0 0 1 24 0" fill="url(#o)" opacity="0.35"/>
  <path d="M32 29.5c-5-3.4-12.5-4.4-21-3.2v15.2c8.5-1.2 16-0.2 21 3.2c5-3.4 12.5-4.4 21-3.2V26.3c-8.5-1.2-16-.2-21 3.2z" fill="url(#o)"/>
  <path d="M32 29.5v15.2" stroke="${cut}" stroke-width="1.6"/>`;

/** @param size px  @param pad fração de respiro  @param rounded cantos arredondados */
function svg(size, { pad = 0.2, rounded = true, bg = NAVY } = {}) {
  const inner = size * (1 - pad * 2);
  const scale = inner / 64;
  const off = size * pad;
  const offY = off + (inner - 48 * scale) / 2;
  const r = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="g" cx="50%" cy="62%" r="60%">
        <stop offset="0" stop-color="#24395a"/><stop offset="1" stop-color="${bg}"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
    <g transform="translate(${off} ${offY}) scale(${scale})">${mark(SAND, NAVY)}</g>
  </svg>`;
}

const jobs = [
  ["icon-192.png", 192, { pad: 0.16 }],
  ["icon-512.png", 512, { pad: 0.16 }],
  // maskable: o sistema recorta em círculo/forma própria → mais respiro e sem cantos
  ["icon-maskable-192.png", 192, { pad: 0.26, rounded: false }],
  ["icon-maskable-512.png", 512, { pad: 0.26, rounded: false }],
  ["apple-touch-icon.png", 180, { pad: 0.16, rounded: false }],
  ["favicon-32.png", 32, { pad: 0.08 }],
];

for (const [name, size, opts] of jobs) {
  await sharp(Buffer.from(svg(size, opts))).png().toFile(path.join(out, name));
  console.log("✔", name);
}

// SVG do favicon (navegadores modernos)
fs.writeFileSync(path.resolve("src/app/icon.svg"), svg(64, { pad: 0.1 }).trim());
console.log("✔ src/app/icon.svg");
