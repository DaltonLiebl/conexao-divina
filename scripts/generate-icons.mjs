// Gera os ícones do app (PWA, Apple, favicon) a partir do símbolo da marca.
// Uso: node scripts/generate-icons.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public/icons");
fs.mkdirSync(out, { recursive: true });

const NAVY = "#17283E";
const GOLD = "#C5A46D";
const SAND = "#F8F5EF";

// Símbolo (mesmo desenho de src/components/brand/logo.tsx), em 48x48.
const mark = (fg, cut) => `
  <g fill="none" stroke-linecap="round">
    <g stroke="${GOLD}" stroke-width="2.2">
      <path d="M24 6.5v4.5"/><path d="M11.6 11.6l3.2 3.2"/><path d="M36.4 11.6l-3.2 3.2"/>
      <path d="M5.5 24h4.5"/><path d="M42.5 24H38"/>
    </g>
    <path d="M12.5 33a11.5 11.5 0 0 1 23 0" fill="${GOLD}"/>
    <path d="M24 24.5v8.5M20.5 27.5h7" stroke="${cut}" stroke-width="2.2"/>
    <path d="M6 33h36" stroke="${fg}" stroke-width="2.4"/>
    <path d="M13 38.5h22" stroke="${fg}" stroke-width="2.4" opacity="0.45"/>
  </g>`;

/** @param size px  @param pad fração de respiro  @param rounded cantos arredondados */
function svg(size, { pad = 0.2, rounded = true, bg = NAVY } = {}) {
  const inner = size * (1 - pad * 2);
  const scale = inner / 48;
  const off = size * pad;
  const r = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="g" cx="50%" cy="62%" r="60%">
        <stop offset="0" stop-color="#24395a"/><stop offset="1" stop-color="${bg}"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
    <g transform="translate(${off} ${off}) scale(${scale})">${mark(SAND, NAVY)}</g>
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
