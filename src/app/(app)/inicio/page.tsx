import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, BookMarked, ChevronRight, Clock, HandHeart, Heart, Map, Search, Sparkles, Sun } from "lucide-react";
import { Greeting, NamePrompt } from "@/components/home/greeting";
import { ContinueSection, MomentPrayer } from "@/components/home/home-client";
import { Scene } from "@/components/brand/scene";
import { SectionHeader, ShortcutTile } from "@/components/ds/layout";
import { VerseText } from "@/components/bible/verse-text";
import { esperancaDoDia, palavraDoDia, todayISO, versiculoDoDia } from "@/lib/daily";
import { getPassage } from "@/lib/bible/server";
import { formatRef } from "@/lib/bible/books";
import { sentimentos } from "@/content/sentimentos";
import { categoriaPorSlug, oracoes } from "@/content/oracoes";
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
    <div className="page space-y-12 lg:space-y-14">
      {/* 1. Saudação + Versículo do dia */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Greeting todayIso={today} />
        </div>

        <Link
          href="/versiculo"
          aria-labelledby="versiculo-titulo"
          className="verse-card group flex flex-col p-7 transition-transform duration-300 hover:-translate-y-0.5 md:p-9 xl:col-span-4"
        >
          <p id="versiculo-titulo" className="eyebrow text-[#e8d5ac]">
            Versículo do dia
          </p>
          <span aria-hidden className="mt-4 font-heading text-6xl leading-none text-[#d4b47c]/50">
            “
          </span>
          <blockquote className="-mt-3 flex-1 font-heading text-[1.45rem] leading-[1.55] italic md:text-[1.6rem]">
            <VerseText text={verse.text} />
          </blockquote>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <span className="font-semibold text-[#d4b47c]">{verse.label}</span>
            <span className="inline-flex items-center gap-1 text-sm text-[#f5f1e8]/75 transition-colors group-hover:text-[#f5f1e8]">
              Reflexão <ChevronRight className="size-4" />
            </span>
          </div>
        </Link>
      </div>

      <NamePrompt />

      {/* 2. Palavra do dia + Oração do momento + Continuar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section aria-labelledby="palavra-titulo" className="lg:col-span-7">
          <Link
            href="/palavra"
            className="surface surface-link group grid grid-cols-1 h-full overflow-hidden md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]"
          >
            <div className="relative h-48 md:h-auto md:min-h-[20rem]">
              <Scene variant={palavra.scene} />
              <div className="absolute inset-0 bg-linear-to-t from-[#0b1220]/50 to-transparent md:bg-linear-to-r md:from-transparent md:to-[#0b1220]/10" />
              <span className="absolute left-4 top-4 rounded-full bg-[#0b1220]/55 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#e8d5ac] ring-1 ring-white/10 backdrop-blur">
                Palavra do dia
              </span>
            </div>
            <div className="flex flex-col p-6 md:p-8">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden /> {palavra.minutes} min de leitura
              </p>
              <h2 id="palavra-titulo" className="mt-2 text-[1.9rem] leading-[1.15] font-semibold md:text-[2.1rem]">
                {palavra.title}
              </h2>
              <p className="mt-4 line-clamp-3 font-heading text-lg leading-relaxed text-muted-foreground italic">
                “<VerseText text={palavraVerse.text} />”
              </p>
              <p className="mt-2 text-sm font-semibold text-gold-ink">{palavraVerse.label}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-gold">
                Ler a palavra
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </section>

        <div className="grid grid-cols-1 content-start gap-4 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          <MomentPrayer
            className="md:col-span-2 lg:col-span-1"
            morning={{ slug: morning.slug, title: morning.title, summary: morning.summary }}
            night={{ slug: night.slug, title: night.title, summary: night.summary }}
          />
          <ContinueSection journeys={jornadas.map((j) => ({ slug: j.slug, title: j.title, total: j.days.length }))} />
        </div>
      </div>

      {/* 3. Como está seu coração */}
      <section aria-labelledby="coracao-titulo">
        <SectionHeader id="coracao-titulo" eyebrow="Para você" title="Como está seu coração hoje?" href="/coracao" />
        <ul className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 xl:grid-cols-6">
          {sentimentos.map((s) => (
            <li key={s.slug} className="shrink-0">
              <Link
                href={`/coracao/${s.slug}`}
                className="surface surface-link flex min-h-12 items-center gap-2.5 rounded-full px-4 py-2 font-medium md:min-h-[4.5rem] md:rounded-2xl md:px-4"
              >
                <span aria-hidden className="text-xl md:text-2xl">
                  {s.emoji}
                </span>
                <span className="whitespace-nowrap md:whitespace-normal md:leading-tight">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Orações sugeridas + Mensagem de esperança */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="oracoes-titulo">
          <SectionHeader id="oracoes-titulo" eyebrow="Orações" title="Sugestões para orar" href="/oracoes" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featuredPrayers.map((p) => (
              <Link key={p.slug} href={`/oracoes/${p.slug}`} className="surface surface-link group flex items-center gap-3.5 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold/12 text-gold">
                  <HandHeart className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-tight">{p.title}</span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                    {categoriaPorSlug(p.category)?.name} · {p.minutes} min
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section
          aria-label="Mensagem de esperança"
          className="relative flex flex-col justify-center overflow-hidden rounded-4xl bg-linear-to-br from-sage/18 via-card to-card p-7 ring-1 ring-border/80 md:p-9 lg:col-span-5"
        >
          <Sparkles className="absolute right-6 top-6 size-6 text-sage-ink/50" aria-hidden />
          <p className="eyebrow text-sage-ink">Mensagem de esperança</p>
          <p className="mt-3 font-heading text-[1.6rem] leading-snug font-semibold md:text-[1.75rem]">{hope.text}</p>
          <p className="mt-4 font-heading leading-relaxed text-muted-foreground italic">
            “<VerseText text={hopeVerse.text} />”
          </p>
          <p className="mt-1.5 text-sm font-semibold text-sage-ink">{formatRef(hope.ref)}</p>
        </section>
      </div>

      {/* 5. Acesso rápido */}
      <section aria-labelledby="explore-titulo">
        <SectionHeader id="explore-titulo" eyebrow="Acesso rápido" title="Explore" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6">
          <ShortcutTile href="/biblia" icon={BookMarked} label="Bíblia Sagrada" hint="66 livros" />
          <ShortcutTile href="/biblia/busca" icon={Search} label="Buscar na Bíblia" hint="Por palavra" />
          <ShortcutTile href="/devocionais" icon={Sun} label="Devocionais" hint="Últimos 30 dias" />
          <ShortcutTile href="/jornadas" icon={Map} label="Jornadas" hint="Planos de 7 dias" />
          <ShortcutTile href="/oracoes" icon={HandHeart} label="Orações" hint="15 temas" />
          <ShortcutTile href="/favoritos" icon={Heart} label="Favoritos" hint="O que você salvou" />
        </div>
      </section>
    </div>
  );
}
