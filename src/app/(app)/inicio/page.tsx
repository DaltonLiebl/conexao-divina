import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChevronRight,
  Compass,
  Feather,
  Frown,
  HandHeart,
  Heart,
  HeartCrack,
  HeartPulse,
  Moon,
  Play,
  Smile,
  Sparkles,
  Sunrise,
  User,
  Wind,
  CloudRain,
  ShieldAlert,
  Dumbbell,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { NamePrompt } from "@/components/home/greeting";
import { FavoriteHeart, VerseQuickActions } from "@/components/home/verse-actions";
import { ProgressCard } from "@/components/progress/progress-ui";
import { JourneyCard } from "@/components/journeys/journey-ui";
import { VerseText, plainVerse } from "@/components/bible/verse-text";
import { esperancaDoDia, palavraDoDia, todayISO, versiculoDoDia } from "@/lib/daily";
import { getPassage } from "@/lib/bible/server";
import { chapterHref, formatRef } from "@/lib/bible/books";
import { sentimentos } from "@/content/sentimentos";
import { oracoes } from "@/content/oracoes";
import { jornadas } from "@/content/jornadas";

export const metadata: Metadata = { title: "Início" };

/** Ícone de cada sentimento (no lugar dos emojis). */
const feelingIcons: Record<string, LucideIcon> = {
  feliz: Smile,
  triste: Frown,
  ansioso: Wind,
  desanimado: CloudRain,
  "com-medo": ShieldAlert,
  solitario: User,
  "coracao-partido": HeartCrack,
  grato: Heart,
  "sem-esperanca": Sunrise,
  "precisando-de-direcao": Compass,
  "precisando-de-paz": Feather,
  "precisando-de-forca": Dumbbell,
};

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

  const quick: { href: string; icon: LucideIcon; title: string; hint: string }[] = [
    { href: `/oracoes/${morning.slug}`, icon: HandHeart, title: "Oração da Manhã", hint: "Comece o dia com Deus" },
    { href: `/oracoes/${night.slug}`, icon: Moon, title: "Oração da Noite", hint: "Termine o dia em oração" },
    { href: "/biblia", icon: BookOpen, title: "Bíblia Sagrada", hint: "Leia e aprofunde sua fé" },
    { href: "/palavra", icon: Feather, title: "Devocional Diário", hint: "Uma mensagem especial" },
  ];

  return (
    <div className="page space-y-6 md:space-y-7">
      {/* 1. Destaque + Progresso */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="relative isolate -mx-5 overflow-hidden md:mx-0 md:rounded-3xl md:shadow-lift md:ring-1 md:ring-white/8 xl:col-span-8">
          <div className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto local otimizada */}
            <img
              src="/images/hero-cruz.webp"
              alt=""
              aria-hidden
              fetchPriority="high"
              className="size-full object-cover object-[65%_center]"
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#0b1220]/90 via-[#0b1220]/45 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-[#0b1220]/70 via-transparent to-transparent md:hidden" />
          </div>
          <div className="flex min-h-[22rem] flex-col justify-center px-6 py-10 text-[#f5f1e8] md:min-h-[20rem] md:px-12 xl:min-h-[21rem]">
            <p className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#e8d5ac]">
              <span aria-hidden className="h-px w-8 bg-[#e8d5ac]" /> Renove sua fé
            </p>
            <h1 className="mt-3 max-w-xl font-heading text-[2.4rem] leading-[1.05] font-semibold md:text-[3.2rem] xl:text-[3.5rem]">
              Caminhe com Deus todos os dias.
            </h1>
            <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-[#f5f1e8]/85">
              Palavra, oração e direção para uma vida mais leve e com propósito.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/palavra"
                className="inline-flex h-12 items-center gap-2.5 rounded-full bg-linear-to-r from-[#f0dfb8] to-[#c9a66b] px-5 text-[0.95rem] font-semibold sm:px-6 sm:text-base text-[#0b1220] shadow-[0_10px_30px_-10px_rgb(212_180_124/0.8)] transition-transform hover:-translate-y-0.5"
              >
                <Play className="size-4 fill-current" aria-hidden /> Começar meu momento com Deus
              </Link>
              <Link
                href="/coracao"
                className="inline-flex h-12 items-center gap-2.5 rounded-full px-6 font-semibold text-[#f5f1e8] ring-1 ring-[#e8d5ac]/50 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <Heart className="size-4.5" aria-hidden /> Como está seu coração?
              </Link>
            </div>
          </div>
        </section>

        <ProgressCard className="xl:col-span-4" />
      </div>

      <NamePrompt />

      {/* 2. Palavra do dia + Versículo do dia */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="surface relative grid grid-cols-1 overflow-hidden sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="relative h-52 sm:h-auto">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto local otimizada */}
            <img src="/images/biblia-aberta.webp" alt="" aria-hidden loading="lazy" className="size-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-card to-transparent sm:bg-linear-to-r sm:from-transparent sm:via-transparent sm:to-card" />
          </div>
          <div className="flex flex-col p-6 pt-4 sm:pl-2 sm:pt-6">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gold/14 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-ink">
                <BookOpen className="size-3.5" aria-hidden /> Palavra do dia
              </span>
              <FavoriteHeart
                className="-mr-2 -mt-2"
                favorite={{ key: `palavra:${palavra.id}`, kind: "palavra", title: palavra.title, subtitle: palavraVerse.label, href: `/palavra/${today}` }}
              />
            </div>
            <h2 className="mt-2 text-[1.65rem] leading-[1.15] font-semibold md:text-[1.85rem]">{palavra.title}</h2>
            <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              <VerseText text={palavraVerse.text} />
            </p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
              <span className="font-semibold text-gold">{palavraVerse.label}</span>
              <Link
                href="/palavra"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gold/15 px-5 text-sm font-semibold text-gold-ink ring-1 ring-gold/30 transition-colors hover:bg-gold/25"
              >
                Ler a palavra <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </article>

        <article className="relative isolate flex flex-col overflow-hidden rounded-3xl p-6 text-[#1d2a3f] shadow-soft ring-1 ring-[#e8d5ac]/40 md:p-8">
          <div className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto local otimizada */}
            <img src="/images/nuvens-douradas.webp" alt="" aria-hidden loading="lazy" className="size-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-r from-[#f8efdc]/95 via-[#f5e6c8]/85 to-[#f3dcae]/45" />
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#0b1220]/8 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#7a5c27]">
            <Bookmark className="size-3.5" aria-hidden /> Versículo do dia
          </span>
          <blockquote className="mt-4 flex-1 font-heading text-[1.35rem] leading-[1.45] font-medium italic md:text-[1.55rem]">
            <span aria-hidden className="mr-1 text-[#b8955a]">
              “
            </span>
            <VerseText text={verse.text} />”
          </blockquote>
          <p className="mt-4 flex items-center justify-center gap-3 font-heading text-lg font-semibold text-[#7a5c27]">
            <span aria-hidden className="h-px w-12 bg-[#b8955a]/60" />
            {verse.label}
            <span aria-hidden className="h-px w-12 bg-[#b8955a]/60" />
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-1">
            <VerseQuickActions
              text={`“${plainVerse(verse.text)}” (${verse.label})`}
              title={verse.label}
              favorite={{
                key: `versiculo:${versiculo.id}`,
                kind: "versiculo",
                title: verse.label,
                subtitle: plainVerse(verse.text).slice(0, 90),
                href: `/versiculo/${today}`,
              }}
            />
            <Link
              href="/versiculo"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#1d2a3f] transition-colors hover:bg-[#0b1220]/8"
            >
              <BookOpen className="size-4" aria-hidden /> Ler contexto
            </Link>
          </div>
        </article>
      </div>

      {/* 3. Acesso rápido */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {quick.map(({ href, icon: Icon, title, hint }) => (
          <li key={href}>
            <Link href={href} className="surface surface-link group flex items-center gap-4 rounded-2xl p-4 md:p-5">
              <Icon className="size-9 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[1.15rem] leading-tight font-semibold">{title}</span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">{hint}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      {/* 4. Como está seu coração */}
      <section aria-labelledby="coracao-titulo" className="pt-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <HeartPulse className="mt-1 size-7 shrink-0 text-gold" aria-hidden />
            <div>
              <h2 id="coracao-titulo" className="text-[1.5rem] leading-tight font-semibold md:text-[1.65rem]">
                Como está seu coração hoje?
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Selecione como você se sente e receba orações e mensagens especiais.
              </p>
            </div>
          </div>
          <Link href="/coracao" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-gold-ink hover:underline sm:inline-flex">
            Ver todos <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {sentimentos.map((s) => {
            const Icon = feelingIcons[s.slug] ?? Heart;
            return (
              <li key={s.slug} className="shrink-0">
                <Link
                  href={`/coracao/${s.slug}`}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-card px-4 text-sm font-medium ring-1 ring-border transition-all hover:bg-gold/10 hover:text-gold-ink hover:ring-gold/40"
                >
                  <Icon className="size-4.5 text-gold" strokeWidth={1.8} aria-hidden />
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 5. Jornadas + Mensagem de esperança */}
      <section aria-labelledby="jornadas-titulo" className="pt-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <Flag className="mt-1 size-7 shrink-0 text-gold" aria-hidden />
            <div>
              <h2 id="jornadas-titulo" className="text-[1.5rem] leading-tight font-semibold md:text-[1.65rem]">
                Jornadas espirituais
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Planos de leitura, oração e reflexão para fortalecer a sua fé.
              </p>
            </div>
          </div>
          <Link href="/jornadas" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-gold-ink hover:underline sm:inline-flex">
            Ver todas <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {jornadas.map((j) => (
            <JourneyCard
              key={j.slug}
              slug={j.slug}
              title={j.title}
              subtitle={j.subtitle}
              scene={j.scene}
              total={j.days.length}
              minutes={j.minutesPerDay}
            />
          ))}
          <section
            aria-label="Mensagem de esperança"
            className="relative isolate flex flex-col justify-center overflow-hidden rounded-3xl p-7 ring-1 ring-border/80 sm:col-span-2"
          >
            <div className="absolute inset-0 -z-10">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto local otimizada */}
              <img src="/images/mar.webp" alt="" aria-hidden loading="lazy" className="size-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-r from-[#0b1220]/95 via-[#0b1220]/80 to-[#0b1220]/40" />
            </div>
            <Sparkles className="absolute right-6 top-6 size-5 text-[#e8d5ac]/60" aria-hidden />
            <p className="eyebrow text-[#e8d5ac]">Mensagem de esperança</p>
            <p className="mt-3 max-w-lg font-heading text-[1.5rem] leading-snug font-semibold text-[#f5f1e8]">{hope.text}</p>
            <p className="mt-3 max-w-lg font-heading leading-relaxed text-[#f5f1e8]/75 italic">
              “<VerseText text={hopeVerse.text} />”
            </p>
            <Link href={chapterHref(hope.ref)} className="mt-2 w-fit text-sm font-semibold text-[#d4b47c] hover:underline">
              {formatRef(hope.ref)}
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
}
