import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, HeartHandshake, Sparkles } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { VerseText, plainVerse } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { DemoNote } from "@/components/content/daily-views";
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
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title={s.label} backHref="/coracao" />
      <div className="text-center">
        <span aria-hidden className="text-6xl">
          {s.emoji}
        </span>
        <h1 className="mx-auto mt-3 max-w-lg text-[2rem] leading-tight font-semibold">{s.welcome}</h1>
      </div>

      <blockquote className="mt-8 rounded-4xl bg-primary p-6 text-primary-foreground shadow-lift md:p-8">
        <p className="font-reading text-[1.35rem] leading-relaxed">
          “<VerseText text={verse.text} />”
        </p>
        <footer className="mt-3 font-semibold text-gold">{verse.label}</footer>
      </blockquote>

      <ActionBar
        className="mt-5"
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

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-[1.7rem] font-semibold">
          <HeartHandshake className="size-6 text-gold-ink" /> Reflexão
        </h2>
        <div className="prose-reading mt-2">
          {s.reflection.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-gold/12 p-5">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-gold-ink">
          <Sparkles className="size-5" /> Oração
        </h2>
        <p className="prose-reading mt-2 italic">{s.prayer}</p>
      </section>

      <Link
        href={chapterHref(s.reading)}
        className="mt-6 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all hover:shadow-lift"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-ink">
          <BookOpen className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-muted-foreground">Sugestão de leitura</span>
          <span className="block text-lg font-bold">{formatRef(s.reading)}</span>
          <span className="block text-muted-foreground">{s.readingWhy}</span>
        </span>
        <ChevronRight className="size-5 shrink-0" />
      </Link>

      <p className="mt-8 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        Este conteúdo é um apoio espiritual e não substitui acompanhamento médico ou psicológico. Em caso de
        sofrimento intenso, procure um profissional ou ligue 188 (CVV, gratuito, 24 horas).
      </p>
      <DemoNote />
    </div>
  );
}
