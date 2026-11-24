// Confere se todas as referências bíblicas do conteúdo existem na Bíblia Livre.
// Uso: npm run check:content
import fs from "node:fs";
import { palavras } from "../src/content/palavras.ts";
import { versiculos } from "../src/content/versiculos.ts";
import { oracoes, categoriasOracao } from "../src/content/oracoes.ts";
import { sentimentos } from "../src/content/sentimentos.ts";
import { jornadas } from "../src/content/jornadas.ts";
import { esperanca } from "../src/content/esperanca.ts";

type Ref = { book: string; chapter: number; verse?: number; verseEnd?: number };
const codes =
  "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SOL ISA JER LAM EZE DAN HOS JOE AMO OBA JON MIC NAH HAB ZEP HAG ZEC MAL MAT MAR LUK JOH ACT ROM 1CO 2CO GAL EPH PHI COL 1TH 2TH 1TI 2TI TIT PHM HEB JAM 1PE 2PE 1JO 2JO 3JO JUD REV".split(
    " ",
  );
const cache = new Map<number, { chapters: [number, string][][] }>();
const load = (id: number) => {
  if (!cache.has(id)) cache.set(id, JSON.parse(fs.readFileSync(`data/biblia/blivre/${id}.json`, "utf8")));
  return cache.get(id)!;
};

let errors = 0;
let checked = 0;
function check(where: string, r: Ref) {
  checked++;
  const id = codes.indexOf(r.book) + 1;
  if (!id) return fail(where, `livro ${r.book}`);
  const ch = load(id).chapters[r.chapter - 1];
  if (!ch) return fail(where, `${r.book} ${r.chapter}`);
  for (const v of [r.verse, r.verseEnd].filter((x): x is number => x != null)) {
    if (!ch.some(([n]) => n === v)) return fail(where, `${r.book} ${r.chapter}:${v}`);
  }
}
function fail(where: string, what: string) {
  errors++;
  console.log(`✘ ${where}: referência inexistente ${what}`);
}
function unique(name: string, ids: string[]) {
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) {
    errors++;
    console.log(`✘ ${name}: ids repetidos ${dup.join(", ")}`);
  }
}

palavras.forEach((p) => check(`palavra ${p.id}`, p.ref));
versiculos.forEach((v) => check(`versículo ${v.id}`, v.ref));
oracoes.forEach((o) => o.ref && check(`oração ${o.slug}`, o.ref));
sentimentos.forEach((s) => (check(`sentimento ${s.slug}`, s.ref), check(`leitura ${s.slug}`, s.reading)));
jornadas.forEach((j) => j.days.forEach((d, i) => check(`jornada ${j.slug} dia ${i + 1}`, d.ref)));
esperanca.forEach((e, i) => check(`esperança ${i + 1}`, e.ref));

unique("palavras", palavras.map((p) => p.id));
unique("versículos", versiculos.map((v) => v.id));
unique("orações", oracoes.map((o) => o.slug));
unique("sentimentos", sentimentos.map((s) => s.slug));
const cats = new Set(categoriasOracao.map((c) => c.slug));
oracoes.forEach((o) => {
  if (!cats.has(o.category)) {
    errors++;
    console.log(`✘ oração ${o.slug}: categoria ${o.category} inexistente`);
  }
});
categoriasOracao.forEach((c) => {
  if (!oracoes.some((o) => o.category === c.slug)) {
    errors++;
    console.log(`✘ categoria ${c.slug} sem oração`);
  }
});

console.log(errors ? `\n${errors} problema(s).` : `✔ ${checked} referências conferidas, conteúdo consistente.`);
process.exit(errors ? 1 : 0);
