import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/shell/top-bar";
import { bookBySlug, books } from "@/lib/bible/books";

export function generateStaticParams() {
  return books.map((b) => ({ livro: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/biblia/[livro]">): Promise<Metadata> {
  return { title: bookBySlug((await params).livro)?.name ?? "Bíblia" };
}

export default async function LivroPage({ params }: PageProps<"/biblia/[livro]">) {
  const b = bookBySlug((await params).livro);
  if (!b) notFound();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title={b.name} backHref="/biblia" />
      <p className="eyebrow">{b.testament === "AT" ? "Antigo Testamento" : "Novo Testamento"}</p>
      <h1 className="mt-1 text-[2.4rem] font-semibold">{b.name}</h1>
      <p className="mt-1 text-muted-foreground">Escolha um capítulo</p>
      <ul className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-8">
        {Array.from({ length: b.chapters }, (_, i) => i + 1).map((c) => (
          <li key={c}>
            <Link
              href={`/biblia/${b.slug}/${c}`}
              className="grid aspect-square min-h-12 place-items-center rounded-2xl bg-card text-lg font-bold shadow-soft ring-1 ring-foreground/5 transition-colors hover:bg-gold/15"
            >
              {c}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
