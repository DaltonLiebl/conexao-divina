import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { ChapterReader } from "@/components/bible/chapter-reader";
import { TrackReading } from "@/components/bible/continue-reading";
import { ReaderFontButton } from "@/components/bible/reader-font";
import { getChapter } from "@/lib/bible/server";
import { BIBLE_TRANSLATION, bookById, bookBySlug } from "@/lib/bible/books";

export async function generateMetadata({ params }: PageProps<"/biblia/[livro]/[cap]">): Promise<Metadata> {
  const { livro, cap } = await params;
  const b = bookBySlug(livro);
  return { title: b ? `${b.name} ${cap}` : "Bíblia" };
}

export default async function CapituloPage({ params }: PageProps<"/biblia/[livro]/[cap]">) {
  const { livro, cap } = await params;
  const b = bookBySlug(livro);
  const chapter = Number(cap);
  if (!b || !Number.isInteger(chapter)) notFound();
  const verses = await getChapter(b.id, chapter);
  if (!verses) notFound();

  const prev = chapter > 1 ? { slug: b.slug, c: chapter - 1, label: `${b.name} ${chapter - 1}` } : b.id > 1 ? (() => {
    const pb = bookById(b.id - 1);
    return { slug: pb.slug, c: pb.chapters, label: `${pb.name} ${pb.chapters}` };
  })() : null;
  const next = chapter < b.chapters ? { slug: b.slug, c: chapter + 1, label: `${b.name} ${chapter + 1}` } : b.id < 66 ? (() => {
    const nb = bookById(b.id + 1);
    return { slug: nb.slug, c: 1, label: `${nb.name} 1` };
  })() : null;

  const label = `${b.name} ${chapter}`;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-36 md:px-8 md:pb-16">
      <TopBar title={label} backHref={`/biblia/${b.slug}`} action={<ReaderFontButton />} />
      <TrackReading book={b.slug} chapter={chapter} label={label} />

      <header className="mb-6 text-center">
        <p className="eyebrow">{BIBLE_TRANSLATION.short}</p>
        <h1 className="mt-1 text-[2.6rem] font-semibold">{b.name}</h1>
        <p className="font-heading text-6xl font-semibold text-gold">{chapter}</p>
      </header>

      <ChapterReader verses={verses} bookCode={b.code} bookSlug={b.slug} bookName={b.name} chapter={chapter} />

      <nav className="mt-10 grid grid-cols-2 gap-3" aria-label="Capítulos">
        {prev ? (
          <Link
            href={`/biblia/${prev.slug}/${prev.c}`}
            className="flex min-h-14 items-center gap-2 rounded-2xl bg-card px-4 font-semibold shadow-soft ring-1 ring-foreground/5"
          >
            <ChevronLeft className="size-5 shrink-0" />
            <span className="truncate">{prev.label}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/biblia/${next.slug}/${next.c}`}
            className="flex min-h-14 items-center justify-end gap-2 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-soft"
          >
            <span className="truncate">{next.label}</span>
            <ChevronRight className="size-5 shrink-0" />
          </Link>
        ) : null}
      </nav>
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">{BIBLE_TRANSLATION.credit}</p>
    </div>
  );
}
