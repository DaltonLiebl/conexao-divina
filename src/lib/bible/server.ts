import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { bookByCode, books, formatRef, type Ref } from "./books";

export type Verse = [number, string];
type BookFile = { code: string; chapters: Verse[][] };

const DIR = path.join(process.cwd(), "data", "biblia", "blivre");
const memo = new Map<number, Promise<BookFile>>();

function loadBook(id: number): Promise<BookFile> {
  let p = memo.get(id);
  if (!p) {
    p = fs.readFile(path.join(DIR, `${id}.json`), "utf8").then((s) => JSON.parse(s) as BookFile);
    memo.set(id, p);
  }
  return p;
}

export const getChapter = cache(async (bookId: number, chapter: number): Promise<Verse[] | null> => {
  const b = books[bookId - 1];
  if (!b || chapter < 1 || chapter > b.chapters) return null;
  const file = await loadBook(bookId);
  return file.chapters[chapter - 1] ?? null;
});

/** Texto de uma referência (um versículo ou intervalo). Lança erro se não existir. */
export const getPassage = cache(async (ref: Ref) => {
  const b = bookByCode(ref.book);
  if (!b) throw new Error(`Livro inexistente: ${ref.book}`);
  const verses = await getChapter(b.id, ref.chapter);
  if (!verses) throw new Error(`Capítulo inexistente: ${formatRef(ref)}`);
  const from = ref.verse ?? 1;
  const to = ref.verseEnd ?? ref.verse ?? verses[verses.length - 1][0];
  const sel = verses.filter(([n]) => n >= from && n <= to);
  if (!sel.length) throw new Error(`Versículo inexistente: ${formatRef(ref)}`);
  return { ref, label: formatRef(ref), verses: sel, text: sel.map(([, t]) => t).join(" ") };
});

export type Passage = Awaited<ReturnType<typeof getPassage>>;

/** Remove acentos e caixa para comparar. */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\[\]]/g, "")
    .toLowerCase();
}

/** Busca por palavras (todas precisam aparecer no versículo). */
export async function searchBible(query: string, limit = 60) {
  const terms = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (!terms.length) return { total: 0, results: [] as { ref: Ref; label: string; text: string }[] };
  const results: { ref: Ref; label: string; text: string }[] = [];
  let total = 0;
  for (const b of books) {
    const file = await loadBook(b.id);
    file.chapters.forEach((verses, ci) => {
      for (const [n, text] of verses) {
        const norm = normalize(text);
        if (terms.every((t) => norm.includes(t))) {
          total++;
          if (results.length < limit) {
            const ref = { book: b.code, chapter: ci + 1, verse: n };
            results.push({ ref, label: formatRef(ref), text });
          }
        }
      }
    });
  }
  return { total, results };
}
