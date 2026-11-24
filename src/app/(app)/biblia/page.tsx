import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { books } from "@/lib/bible/books";
import { ContinueReading } from "@/components/bible/continue-reading";
import { BIBLE_TRANSLATION } from "@/lib/bible/books";

export const metadata: Metadata = { title: "Bíblia Sagrada" };

export default function BibliaPage() {
  const at = books.filter((b) => b.testament === "AT");
  const nt = books.filter((b) => b.testament === "NT");
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 pt-8 md:px-8 md:pb-16">
      <p className="eyebrow">{BIBLE_TRANSLATION.name}</p>
      <h1 className="mt-1 text-[2.4rem] leading-tight font-semibold">Bíblia Sagrada</h1>

      <form action="/biblia/busca" className="mt-5 flex gap-2" role="search">
        <label htmlFor="busca-biblia" className="sr-only">
          Buscar palavras na Bíblia
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="busca-biblia"
            name="q"
            type="search"
            placeholder="Buscar palavras (ex.: paz, amor)"
            className="h-13 w-full rounded-full border border-input bg-card pl-12 pr-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button type="submit" className="h-13 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
          Buscar
        </button>
      </form>

      <ContinueReading className="mt-5" />

      <BookSection title="Antigo Testamento" list={at} />
      <BookSection title="Novo Testamento" list={nt} />

      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">{BIBLE_TRANSLATION.credit}</p>
    </div>
  );
}

function BookSection({ title, list }: { title: string; list: typeof books }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-[1.7rem] font-semibold">
        {title} <span className="font-sans text-base font-semibold text-muted-foreground">· {list.length} livros</span>
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((b) => (
          <li key={b.id}>
            <Link
              href={`/biblia/${b.slug}`}
              className="flex min-h-14 items-center justify-between gap-2 rounded-2xl bg-card px-4 shadow-soft ring-1 ring-foreground/5 transition-colors hover:bg-gold/10"
            >
              <span className="font-semibold leading-tight">{b.name}</span>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">{b.chapters} cap.</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
