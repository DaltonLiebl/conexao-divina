import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Footprints, Sparkles } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { VerseText, plainVerse } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { CompleteDayButton } from "@/components/journeys/journey-ui";
import { DemoNote } from "@/components/content/daily-views";
import { getPassage } from "@/lib/bible/server";
import { chapterHref } from "@/lib/bible/books";
import { jornadaPorSlug, jornadas } from "@/content/jornadas";

export function generateStaticParams() {
  return jornadas.flatMap((j) => j.days.map((_, i) => ({ slug: j.slug, dia: String(i + 1) })));
}

export async function generateMetadata({ params }: PageProps<"/jornadas/[slug]/[dia]">): Promise<Metadata> {
  const { slug, dia } = await params;
  const j = jornadaPorSlug(slug);
  return { title: j ? `${j.title} · Dia ${dia}` : "Jornada" };
}

export default async function JornadaDiaPage({ params }: PageProps<"/jornadas/[slug]/[dia]">) {
  const { slug, dia } = await params;
  const j = jornadaPorSlug(slug);
  const n = Number(dia);
  const d = j?.days[n - 1];
  if (!j || !d) notFound();
  const verse = await getPassage(d.ref);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title={`${j.title} · Dia ${n}`} backHref={`/jornadas/${j.slug}`} />
      <p className="eyebrow">
        Dia {n} de {j.days.length}
      </p>
      <h1 className="mt-1 text-[2.4rem] leading-tight font-semibold">{d.title}</h1>

      <blockquote className="mt-6 border-l-4 border-gold pl-5">
        <p className="font-reading text-[1.3rem] leading-relaxed italic">
          “<VerseText text={verse.text} />”
        </p>
        <Link href={chapterHref(d.ref)} className="mt-2 inline-flex items-center gap-1 font-semibold text-gold-ink hover:underline">
          {verse.label} <ChevronRight className="size-4" />
        </Link>
      </blockquote>

      <ActionBar
        className="mt-5"
        shareTitle={d.title}
        shareText={`“${plainVerse(verse.text)}” (${verse.label})`}
        listenText={[d.title, `${plainVerse(verse.text)}. ${verse.label}.`, ...d.reflection, "Prática de hoje.", d.practice, "Oração.", d.prayer].join(" ")}
      />

      <div className="prose-reading mt-8">
        {d.reflection.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <section className="mt-8 rounded-3xl bg-sage/12 p-5">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-sage-ink">
          <Footprints className="size-5" /> Prática de hoje
        </h2>
        <p className="mt-2 text-[1.05rem] leading-relaxed">{d.practice}</p>
      </section>

      <section className="mt-5 rounded-3xl bg-gold/12 p-5">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-gold-ink">
          <Sparkles className="size-5" /> Oração
        </h2>
        <p className="prose-reading mt-2 italic">{d.prayer}</p>
      </section>

      <CompleteDayButton slug={j.slug} day={n} total={j.days.length} />
      <DemoNote />
    </div>
  );
}
