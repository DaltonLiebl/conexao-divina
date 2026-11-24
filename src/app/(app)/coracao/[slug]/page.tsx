import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, HeartHandshake, HeartPulse, Sparkles } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { VerseText, plainVerse } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { Callout, DemoNote } from "@/components/content/daily-views";
import { AsideCard, ListLink, ReadingLayout } from "@/components/ds/layout";
import { getPassage } from "@/lib/bible/server";
import { chapterHref, formatRef } from "@/lib/bible/books";
import { sentimentoPorSlug, sentimentos } from "@/content/sentimentos";

export function generateStaticParams() {
  return sentimentos.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/coracao/[slug]">): Promise<Metadata> {
  const s = sentimentoPorSlug((await params).slug);
  return { title: s ? `Sentindo-se: ${s.label}` : "Como está seu coração?" };
}

export default async function SentimentoPage({ params }: PageProps<"/coracao/[slug]">) {
  const s = sentimentoPorSlug((await params).slug);
  if (!s) notFound();
  const verse = await getPassage(s.ref);
  const listen = [s.welcome, `${plainVerse(verse.text)}. ${verse.label}.`, ...s.reflection, "Oração.", s.prayer].join(" ");

  return (
    <div className="page">
      <TopBar title={s.label} backHref="/coracao" />

      <header className="mb-8 lg:mb-10">
        <span aria-hidden className="text-5xl md:text-6xl">
          {s.emoji}
        </span>
        <p className="eyebrow mt-4">Quando estou: {s.label}</p>
        <h1 className="page-title mt-2 max-w-4xl">{s.welcome}</h1>
      </header>

      <ReadingLayout
        actions={
          <ActionBar className="grid grid-cols-2 gap-2 sm:flex"
                shareTitle={`Uma palavra para quando estou: ${s.label}`}
                shareText={`“${plainVerse(verse.text)}” (${verse.label})`}
                listenText={listen}
                favorite={{
                  key: `sentimento:${s.slug}`,
                  kind: "sentimento",
                  title: `Para quando estou: ${s.label}`,
                  subtitle: verse.label,
                  href: `/coracao/${s.slug}`,
                }}
              />
        }
        aside={
          <>
            <AsideCard title="Sugestão de leitura">
              <ListLink href={chapterHref(s.reading)} icon={BookOpen} title={formatRef(s.reading)} hint={s.readingWhy} />
            </AsideCard>
            <AsideCard title="Outros sentimentos">
              <ListLink href="/coracao" icon={HeartPulse} title="Escolher outro sentimento" />
            </AsideCard>
          </>
        }
      >
        <blockquote className="verse-card p-7 md:p-9">
          <p className="font-heading text-[1.4rem] leading-relaxed italic md:text-[1.6rem]">
            “<VerseText text={verse.text} />”
          </p>
          <footer className="mt-4 font-semibold text-[#d4b47c]">{verse.label}</footer>
        </blockquote>

        <section className="mt-10">
          <h2 className="flex items-center gap-2.5 text-[1.6rem] font-semibold md:text-[1.8rem]">
            <HeartHandshake className="size-6 text-gold" aria-hidden /> Reflexão
          </h2>
          <div className="prose-reading mt-3 text-[1.1rem]">
            {s.reflection.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <Callout icon={Sparkles} title="Oração">
          <p className="prose-reading italic">{s.prayer}</p>
        </Callout>

        <p className="mt-8 rounded-2xl border border-border/70 bg-background-2/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          Este conteúdo é um apoio espiritual e não substitui acompanhamento médico ou psicológico. Em caso de
          sofrimento intenso, procure um profissional ou ligue 188 (CVV, gratuito, 24 horas).
        </p>
        <DemoNote />
      </ReadingLayout>
    </div>
  );
}
