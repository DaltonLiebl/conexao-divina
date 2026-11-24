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
    <div className="page">
      <TopBar title="Buscar na Bíblia" backHref="/biblia" />
      <h1 className="page-title mb-6">Buscar na Bíblia</h1>
      <form className="flex max-w-3xl gap-2" role="search">
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
            <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {results.map((r) => (
                <li key={r.label}>
                  <Link
                    href={chapterHref(r.ref)}
                    className="surface surface-link block h-full p-5"
                  >
                    <span className="block text-sm font-bold text-gold-ink">{r.label}</span>
                    <span className="mt-1.5 block font-reading text-[1.05rem] leading-relaxed">
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
