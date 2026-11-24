import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Footprints, Map, Sparkles } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { VerseText, plainVerse } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { CompleteDayButton } from "@/components/journeys/journey-ui";
import { Callout, DemoNote } from "@/components/content/daily-views";
import { AsideCard, ListLink, ReadingLayout } from "@/components/ds/layout";
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
    <div className="page">
      <TopBar title={`${j.title} · Dia ${n}`} backHref={`/jornadas/${j.slug}`} />

      <header className="mb-8 lg:mb-10">
        <p className="eyebrow">
          {j.title} · Dia {n} de {j.days.length}
        </p>
        <h1 className="page-title mt-2 max-w-4xl">{d.title}</h1>
      </header>

      <ReadingLayout
        actions={
          <ActionBar className="grid grid-cols-2 gap-2 sm:flex"
                shareTitle={d.title}
                shareText={`“${plainVerse(verse.text)}” (${verse.label})`}
                listenText={[d.title, `${plainVerse(verse.text)}. ${verse.label}.`, ...d.reflection, "Prática de hoje.", d.practice, "Oração.", d.prayer].join(" ")}
              />
        }
        aside={
          <>
            <AsideCard title="Jornada">
              <ListLink href={`/jornadas/${j.slug}`} icon={Map} title={j.title} hint={`Ver os ${j.days.length} dias`} />
            </AsideCard>
          </>
        }
      >
        <blockquote className="verse-card p-7 md:p-9">
          <p className="font-heading text-[1.35rem] leading-relaxed italic md:text-[1.5rem]">
            “<VerseText text={verse.text} />”
          </p>
          <Link href={chapterHref(d.ref)} className="mt-4 inline-flex items-center gap-1 font-semibold text-[#d4b47c] hover:underline">
            {verse.label} <ChevronRight className="size-4" />
          </Link>
        </blockquote>

        <div className="prose-reading mt-9 text-[1.12rem]">
          {d.reflection.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <Callout icon={Footprints} title="Prática de hoje" tone="sage">
          <p className="text-[1.05rem] leading-relaxed">{d.practice}</p>
        </Callout>

        <Callout icon={Sparkles} title="Oração">
          <p className="prose-reading italic">{d.prayer}</p>
        </Callout>

        <CompleteDayButton slug={j.slug} day={n} total={j.days.length} />
        <DemoNote />
      </ReadingLayout>
    </div>
  );
}
