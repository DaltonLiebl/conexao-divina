// Converte o arquivo VPL da Bíblia Livre (eBible.org, porbr2018_vpl.txt) em
// um JSON por livro: data/biblia/blivre/<id>.json = { code, chapters: [[ [verso, texto], ... ], ...] }
// Uso: node scripts/build-bible.mjs caminho/para/porbr2018_vpl.txt
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("Informe o caminho do porbr2018_vpl.txt");
  process.exit(1);
}

const order = [];
const data = new Map();
for (const line of fs.readFileSync(src, "utf8").split(/\r?\n/)) {
  if (!line.trim()) continue;
  const m = line.match(/^(\S+) (\d+):(\d+) (.*)$/);
  if (!m) throw new Error("Linha inesperada: " + line.slice(0, 80));
  const [, code, ch, v, text] = m;
  if (!data.has(code)) {
    data.set(code, []);
    order.push(code);
  }
  const chapters = data.get(code);
  const ci = Number(ch) - 1;
  (chapters[ci] ??= []).push([Number(v), text.trim()]);
}

if (order.length !== 66) throw new Error(`Esperava 66 livros, encontrei ${order.length}`);

const out = path.resolve("data/biblia/blivre");
fs.mkdirSync(out, { recursive: true });
let verses = 0;
order.forEach((code, i) => {
  const chapters = data.get(code);
  chapters.forEach((c, ci) => {
    if (!c?.length) throw new Error(`${code} capítulo ${ci + 1} vazio`);
    verses += c.length;
  });
  fs.writeFileSync(path.join(out, `${i + 1}.json`), JSON.stringify({ code, chapters }));
});
console.log(`✔ ${order.length} livros, ${verses} versículos → ${out}`);
