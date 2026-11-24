/** Os 66 livros (cânon protestante), na ordem e com os códigos USFM do arquivo-fonte. */
export type Testament = "AT" | "NT";
export type Book = {
  id: number;
  code: string; // código USFM usado no arquivo da Bíblia Livre
  slug: string;
  abbrev: string;
  name: string;
  testament: Testament;
  chapters: number;
};

const raw: [string, string, string, string, number][] = [
  ["GEN", "genesis", "Gn", "Gênesis", 50], ["EXO", "exodo", "Êx", "Êxodo", 40], ["LEV", "levitico", "Lv", "Levítico", 27],
  ["NUM", "numeros", "Nm", "Números", 36], ["DEU", "deuteronomio", "Dt", "Deuteronômio", 34], ["JOS", "josue", "Js", "Josué", 24],
  ["JDG", "juizes", "Jz", "Juízes", 21], ["RUT", "rute", "Rt", "Rute", 4], ["1SA", "1-samuel", "1Sm", "1 Samuel", 31],
  ["2SA", "2-samuel", "2Sm", "2 Samuel", 24], ["1KI", "1-reis", "1Rs", "1 Reis", 22], ["2KI", "2-reis", "2Rs", "2 Reis", 25],
  ["1CH", "1-cronicas", "1Cr", "1 Crônicas", 29], ["2CH", "2-cronicas", "2Cr", "2 Crônicas", 36], ["EZR", "esdras", "Ed", "Esdras", 10],
  ["NEH", "neemias", "Ne", "Neemias", 13], ["EST", "ester", "Et", "Ester", 10], ["JOB", "jo", "Jó", "Jó", 42],
  ["PSA", "salmos", "Sl", "Salmos", 150], ["PRO", "proverbios", "Pv", "Provérbios", 31], ["ECC", "eclesiastes", "Ec", "Eclesiastes", 12],
  ["SOL", "cantares", "Ct", "Cânticos", 8], ["ISA", "isaias", "Is", "Isaías", 66], ["JER", "jeremias", "Jr", "Jeremias", 52],
  ["LAM", "lamentacoes", "Lm", "Lamentações", 5], ["EZE", "ezequiel", "Ez", "Ezequiel", 48], ["DAN", "daniel", "Dn", "Daniel", 12],
  ["HOS", "oseias", "Os", "Oseias", 14], ["JOE", "joel", "Jl", "Joel", 3], ["AMO", "amos", "Am", "Amós", 9],
  ["OBA", "obadias", "Ob", "Obadias", 1], ["JON", "jonas", "Jn", "Jonas", 4], ["MIC", "miqueias", "Mq", "Miqueias", 7],
  ["NAH", "naum", "Na", "Naum", 3], ["HAB", "habacuque", "Hc", "Habacuque", 3], ["ZEP", "sofonias", "Sf", "Sofonias", 3],
  ["HAG", "ageu", "Ag", "Ageu", 2], ["ZEC", "zacarias", "Zc", "Zacarias", 14], ["MAL", "malaquias", "Ml", "Malaquias", 4],
  ["MAT", "mateus", "Mt", "Mateus", 28], ["MAR", "marcos", "Mc", "Marcos", 16], ["LUK", "lucas", "Lc", "Lucas", 24],
  ["JOH", "joao", "Jo", "João", 21], ["ACT", "atos", "At", "Atos", 28], ["ROM", "romanos", "Rm", "Romanos", 16],
  ["1CO", "1-corintios", "1Co", "1 Coríntios", 16], ["2CO", "2-corintios", "2Co", "2 Coríntios", 13], ["GAL", "galatas", "Gl", "Gálatas", 6],
  ["EPH", "efesios", "Ef", "Efésios", 6], ["PHI", "filipenses", "Fp", "Filipenses", 4], ["COL", "colossenses", "Cl", "Colossenses", 4],
  ["1TH", "1-tessalonicenses", "1Ts", "1 Tessalonicenses", 5], ["2TH", "2-tessalonicenses", "2Ts", "2 Tessalonicenses", 3],
  ["1TI", "1-timoteo", "1Tm", "1 Timóteo", 6], ["2TI", "2-timoteo", "2Tm", "2 Timóteo", 4], ["TIT", "tito", "Tt", "Tito", 3],
  ["PHM", "filemom", "Fm", "Filemom", 1], ["HEB", "hebreus", "Hb", "Hebreus", 13], ["JAM", "tiago", "Tg", "Tiago", 5],
  ["1PE", "1-pedro", "1Pe", "1 Pedro", 5], ["2PE", "2-pedro", "2Pe", "2 Pedro", 3], ["1JO", "1-joao", "1Jo", "1 João", 5],
  ["2JO", "2-joao", "2Jo", "2 João", 1], ["3JO", "3-joao", "3Jo", "3 João", 1], ["JUD", "judas", "Jd", "Judas", 1],
  ["REV", "apocalipse", "Ap", "Apocalipse", 22],
];

export const books: Book[] = raw.map(([code, slug, abbrev, name, chapters], i) => ({
  id: i + 1,
  code,
  slug,
  abbrev,
  name,
  testament: i < 39 ? "AT" : "NT",
  chapters,
}));

const bySlug = new Map(books.map((b) => [b.slug, b]));
const byCode = new Map(books.map((b) => [b.code, b]));

export const bookBySlug = (slug: string) => bySlug.get(slug);
export const bookByCode = (code: string) => byCode.get(code);
export const bookById = (id: number) => books[id - 1];

/** Referência a uma passagem. verseEnd opcional (intervalo no mesmo capítulo). */
export type Ref = { book: string; chapter: number; verse?: number; verseEnd?: number };

export function formatRef(ref: Ref) {
  const b = bookByCode(ref.book);
  const name = b?.name ?? ref.book;
  if (!ref.verse) return `${name} ${ref.chapter}`;
  return `${name} ${ref.chapter}:${ref.verse}${ref.verseEnd ? `-${ref.verseEnd}` : ""}`;
}

export function chapterHref(ref: Pick<Ref, "book" | "chapter" | "verse">) {
  const b = bookByCode(ref.book);
  return `/biblia/${b?.slug}/${ref.chapter}${ref.verse ? `#v${ref.verse}` : ""}`;
}

export const BIBLE_TRANSLATION = {
  id: "blivre",
  name: "Bíblia Livre",
  short: "BLIVRE",
  credit:
    "Todas as Escrituras em português citadas são da Bíblia Livre (BLIVRE), Copyright © Diego Santos, Mario Sérgio e Marco Teles, http://sites.google.com/site/biblialivre/ — fevereiro de 2018. Licença Creative Commons Atribuição 4.0 Brasil (http://creativecommons.org/licenses/by/4.0/br/). Reprodução permitida desde que devidamente mencionados fonte e autores. Texto obtido em eBible.org (versão de 2022-03-08).",
};
