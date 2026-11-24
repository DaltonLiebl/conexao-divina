import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { books, BIBLE_TRANSLATION } from "@/lib/bible/books";
import { ContinueReading } from "@/components/bible/continue-reading";
import { PageHeader } from "@/components/ds/layout";

export const metadata: Metadata = { title: "Bíblia Sagrada" };

export default function BibliaPage() {
  const at = books.filter((b) => b.testament === "AT");
  const nt = books.filter((b) => b.testament === "NT");
  return (
    <div className="page">
      <PageHeader eyebrow={BIBLE_TRANSLATION.name} title="Bíblia Sagrada" lead="66 livros, do Gênesis ao Apocalipse.">
        <form action="/biblia/busca" className="flex gap-2" role="search">
          <label htmlFor="busca-biblia" className="sr-only">
            Buscar palavras na Bíblia
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="busca-biblia"
              name="q"
              type="search"
              placeholder="Buscar palavras (ex.: paz, amor)"
              className="h-13 w-full rounded-full border border-border bg-card pl-12 pr-4 text-base outline-none transition-colors focus-visible:border-gold/60 focus-visible:ring-3 focus-visible:ring-gold/20"
            />
          </div>
          <button
            type="submit"
            className="h-13 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Buscar
          </button>
        </form>
      </PageHeader>

      <ContinueReading className="mb-10" />

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:gap-12">
        <BookSection title="Antigo Testamento" list={at} />
        <BookSection title="Novo Testamento" list={nt} />
      </div>

      <p className="mt-12 max-w-3xl text-sm leading-relaxed text-muted-foreground">{BIBLE_TRANSLATION.credit}</p>
    </div>
  );
}

function BookSection({ title, list }: { title: string; list: typeof books }) {
  return (
    <section>
      <h2 className="mb-4 flex items-baseline gap-3 text-[1.6rem] font-semibold md:text-[1.8rem]">
        {title}
        <span className="font-sans text-sm font-medium text-muted-foreground">{list.length} livros</span>
      </h2>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3">
        {list.map((b) => (
          <li key={b.id}>
            <Link
              href={`/biblia/${b.slug}`}
              className="flex min-h-14 items-center justify-between gap-2 rounded-2xl bg-card px-4 ring-1 ring-border/80 transition-all hover:bg-accent hover:ring-gold/40"
            >
              <span className="font-medium leading-tight">{b.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{b.chapters}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
