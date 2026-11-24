import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BookMarked, ChevronRight, HandHeart, Heart, Map, Quote, Search, Sparkles } from "lucide-react";
import { Greeting, NamePrompt } from "@/components/home/greeting";
import { ContinueSection, MomentPrayer } from "@/components/home/home-client";
import { Scene } from "@/components/brand/scene";
import { SectionHeader, ShortcutTile } from "@/components/ds/layout";
import { VerseText } from "@/components/bible/verse-text";
import { esperancaDoDia, palavraDoDia, todayISO, versiculoDoDia } from "@/lib/daily";
import { getPassage } from "@/lib/bible/server";
import { formatRef } from "@/lib/bible/books";
import { sentimentos } from "@/content/sentimentos";
import { oracoes } from "@/content/oracoes";
import { jornadas } from "@/content/jornadas";

export const metadata: Metadata = { title: "Início" };

export default async function HomePage() {
  await connection(); // o conteúdo muda a cada dia
  const today = todayISO();
  const palavra = palavraDoDia(today);
  const versiculo = versiculoDoDia(today);
  const hope = esperancaDoDia(today);
  const [palavraVerse, verse, hopeVerse] = await Promise.all([
    getPassage(palavra.ref),
    getPassage(versiculo.ref),
    getPassage(hope.ref),
  ]);

  const morning = oracoes.find((o) => o.moment === "manha")!;
  const night = oracoes.find((o) => o.moment === "noite")!;
  const featuredPrayers = ["pela-familia", "de-protecao", "por-paz", "de-gratidao"]
    .map((s) => oracoes.find((o) => o.slug === s)!)
    .filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16 md:pt-6">
      <Greeting todayIso={today} />

      <div className="mt-6 space-y-10">
        <NamePrompt />

        {/* Palavra do dia */}
        <section aria-labelledby="palavra-titulo">
          <Link
            href="/palavra"
            className="group block overflow-hidden rounded-4xl bg-card shadow-soft ring-1 ring-foreground/5 transition-all hover:shadow-lift"
          >
            <div className="relative h-36">
              <Scene variant={palavra.scene} />
              <span className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                Palavra do dia
              </span>
            </div>
            <div className="p-5 md:p-6">
              <h2 id="palavra-titulo" className="text-[1.9rem] leading-tight font-semibold">
                {palavra.title}
              </h2>
              <p className="mt-2 line-clamp-2 font-reading text-lg text-muted-foreground italic">
                “<VerseText text={palavraVerse.text} />”
              </p>
              <p className="mt-1 text-sm font-semibold text-gold-ink">{palavraVerse.label}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-semibold text-primary">
                Ler a palavra · {palavra.minutes} min
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </section>

        {/* Versículo do dia */}
        <section aria-labelledby="versiculo-titulo">
          <Link
            href="/versiculo"
            className="group block rounded-4xl bg-primary p-6 text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 md:p-8"
          >
            <p id="versiculo-titulo" className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
              Versículo do dia
            </p>
            <Quote className="mt-3 size-8 text-gold/70" aria-hidden />
            <blockquote className="mt-2 font-reading text-[1.35rem] leading-relaxed">
              <VerseText text={verse.text} />
            </blockquote>
            <p className="mt-4 flex items-center justify-between font-semibold">
              <span className="text-gold">{verse.label}</span>
              <span className="inline-flex items-center gap-1 text-sm opacity-90">
                Contexto e reflexão <ChevronRight className="size-4" />
              </span>
            </p>
          </Link>
        </section>

        {/* Oração do momento */}
        <MomentPrayer
          morning={{ slug: morning.slug, title: morning.title, summary: morning.summary }}
          night={{ slug: night.slug, title: night.title, summary: night.summary }}
        />

        {/* Como está seu coração */}
        <section>
          <SectionHeader eyebrow="Para você" title="Como está seu coração hoje?" href="/coracao" />
          <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            {sentimentos.map((s) => (
              <Link
                key={s.slug}
                href={`/coracao/${s.slug}`}
                className="flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-card px-4 font-semibold shadow-soft ring-1 ring-foreground/5 transition-colors hover:bg-gold/10"
              >
                <span aria-hidden className="text-xl">
                  {s.emoji}
                </span>
                {s.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Continuar */}
        <section>
          <SectionHeader eyebrow="Sua jornada" title="Continue de onde parou" />
          <ContinueSection journeys={jornadas.map((j) => ({ slug: j.slug, title: j.title, total: j.days.length }))} />
        </section>

        {/* Orações sugeridas */}
        <section>
          <SectionHeader eyebrow="Orações" title="Sugestões para orar" href="/oracoes" />
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredPrayers.map((p) => (
              <Link
                key={p.slug}
                href={`/oracoes/${p.slug}`}
                className="group flex items-center gap-3 rounded-3xl bg-card p-4 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold/12 text-gold-ink">
                  <HandHeart className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-tight">{p.title}</span>
                  <span className="block truncate text-sm text-muted-foreground">{p.summary}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* Atalhos */}
        <section>
          <SectionHeader eyebrow="Acesso rápido" title="Explore" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ShortcutTile href="/biblia" icon={BookMarked} label="Bíblia" hint="66 livros" />
            <ShortcutTile href="/biblia/busca" icon={Search} label="Buscar na Bíblia" hint="Por palavra" />
            <ShortcutTile href="/jornadas" icon={Map} label="Jornadas" hint="Planos de 7 dias" />
            <ShortcutTile href="/anteriores" icon={Sparkles} label="Dias anteriores" hint="Palavras e versículos" />
            <ShortcutTile href="/favoritos" icon={Heart} label="Favoritos" hint="O que você salvou" />
            <ShortcutTile href="/oracoes" icon={HandHeart} label="Orações" hint="15 categorias" />
          </div>
        </section>

        {/* Mensagem de esperança */}
        <section className="relative overflow-hidden rounded-4xl bg-sage/15 p-6 text-center md:p-8">
          <p className="eyebrow text-sage-ink">Mensagem de esperança</p>
          <p className="mx-auto mt-3 max-w-md font-heading text-[1.7rem] leading-snug font-semibold">{hope.text}</p>
          <p className="mx-auto mt-3 max-w-md font-reading text-muted-foreground italic">
            “<VerseText text={hopeVerse.text} />”
          </p>
          <p className="mt-1 text-sm font-semibold text-sage-ink">{formatRef(hope.ref)}</p>
        </section>
      </div>
    </div>
  );
}
