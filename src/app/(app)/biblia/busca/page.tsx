import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { EmptyState } from "@/components/ds/states";
import { VerseText } from "@/components/bible/verse-text";
import { searchBible } from "@/lib/bible/server";
import { chapterHref } from "@/lib/bible/books";

export const metadata: Metadata = { title: "Buscar na Bíblia" };

export default async function BuscaPage({ searchParams }: PageProps<"/biblia/busca">) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 80);
  const { total, results } = q ? await searchBible(q) : { total: 0, results: [] };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title="Buscar na Bíblia" backHref="/biblia" />
      <form className="flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Palavras
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          autoFocus={!q}
          placeholder="Ex.: paz, amor, Senhor é meu pastor"
          className="h-13 min-w-0 flex-1 rounded-full border border-input bg-card px-5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button type="submit" className="h-13 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
          Buscar
        </button>
      </form>

      {q ? (
        total ? (
          <>
            <p className="mt-5 text-muted-foreground">
              {total} {total === 1 ? "versículo encontrado" : "versículos encontrados"}
              {total > results.length ? ` (mostrando os ${results.length} primeiros)` : ""}
            </p>
            <ul className="mt-3 space-y-3">
              {results.map((r) => (
                <li key={r.label}>
                  <Link
                    href={chapterHref(r.ref)}
                    className="block rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all hover:shadow-lift"
                  >
                    <span className="block text-sm font-bold text-gold-ink">{r.label}</span>
                    <span className="mt-1 block font-reading leading-relaxed">
                      <VerseText text={r.text} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            className="mt-6"
            icon={SearchX}
            title="Nenhum versículo encontrado"
            description={`Não encontramos versículos com "${q}". Tente outra palavra ou menos palavras.`}
          />
        )
      ) : (
        <p className="mt-5 text-muted-foreground">
          Digite uma ou mais palavras. A busca ignora acentos e encontra versículos que contenham todas elas.
        </p>
      )}
    </div>
  );
}
