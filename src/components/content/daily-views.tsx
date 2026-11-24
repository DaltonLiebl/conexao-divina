import Link from "next/link";
import { BookMarked, BookOpen, CalendarDays, ChevronRight, Clock, HandHeart, HeartPulse, Lightbulb, Sparkles, Sun } from "lucide-react";
import { Scene } from "@/components/brand/scene";
import { VerseText, plainVerse } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { AsideCard, ListLink, ReadingLayout } from "@/components/ds/layout";
import { getPassage } from "@/lib/bible/server";
import { chapterHref, formatRef } from "@/lib/bible/books";
import { formatLongDate, palavraDoDia, versiculoDoDia } from "@/lib/daily";

/** Nota exigida: conteúdo inicial demonstrativo identificado. */
export function DemoNote() {
  return (
    <p className="mt-10 rounded-2xl border border-border/70 bg-background-2/60 px-4 py-3 text-sm text-muted-foreground">
      Conteúdo inicial do Conexão Divina. Textos bíblicos da Bíblia Livre (BLIVRE), licença CC BY 4.0.
    </p>
  );
}

/** Bloco destacado (aplicação, oração, prática). */
export function Callout({
  icon: Icon,
  title,
  tone = "gold",
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  tone?: "gold" | "sage";
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        tone === "gold"
          ? "mt-6 rounded-3xl bg-linear-to-br from-gold/12 to-gold/4 p-6 ring-1 ring-gold/20"
          : "mt-6 rounded-3xl bg-linear-to-br from-sage/14 to-sage/4 p-6 ring-1 ring-sage/25"
      }
    >
      <h2
        className={`flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.14em] ${
          tone === "gold" ? "text-gold-ink" : "text-sage-ink"
        }`}
      >
        <Icon className="size-[1.1rem]" aria-hidden /> {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Coluna lateral comum às leituras diárias. */
function DailyAside({ kind }: { kind: "palavra" | "versiculo" }) {
  return (
    <AsideCard title="Continue com Deus">
      <div className="space-y-1">
        {kind === "palavra" ? (
          <ListLink href="/versiculo" icon={BookMarked} title="Versículo do dia" hint="Com contexto e reflexão" />
        ) : (
          <ListLink href="/palavra" icon={Sun} title="Palavra do dia" hint="Reflexão, aplicação e oração" />
        )}
        <ListLink href="/coracao" icon={HeartPulse} title="Como está seu coração?" hint="Uma palavra para o que você sente" />
        <ListLink href="/oracoes" icon={HandHeart} title="Orações" hint="15 temas para orar" />
        <ListLink href="/devocionais" icon={CalendarDays} title="Dias anteriores" hint="Últimos 30 dias" />
      </div>
    </AsideCard>
  );
}

export async function PalavraView({ iso, isToday }: { iso: string; isToday: boolean }) {
  const p = palavraDoDia(iso);
  const verse = await getPassage(p.ref);
  const shareText = `${p.title}\n\n“${plainVerse(verse.text)}” (${verse.label})\n\n${p.reflection[0]}`;
  const listenText = [
    p.title,
    `${plainVerse(verse.text)}. ${verse.label}.`,
    ...p.reflection,
    "Aplicação para hoje.",
    p.application,
    "Oração.",
    p.prayer,
  ].join(" ");

  return (
    <article>
      {/* Capa */}
      <header className="relative isolate -mx-5 overflow-hidden md:mx-0 md:rounded-4xl md:ring-1 md:ring-white/5">
        <div className="absolute inset-0 -z-10">
          <Scene variant={p.scene} />
          <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/55 to-[#0b1220]/5" />
        </div>
        <div className="flex min-h-[18rem] flex-col justify-end px-6 pb-8 pt-20 text-[#f5f1e8] md:min-h-[22rem] md:px-10 md:pb-10">
          <p className="eyebrow text-[#e8d5ac]">{isToday ? "Palavra do dia" : "Palavra de " + formatLongDate(iso)}</p>
          <h1 className="mt-2 max-w-3xl font-heading text-[2.3rem] leading-[1.08] font-semibold md:text-[3rem] xl:text-[3.4rem]">
            {p.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#f5f1e8]/75">
            <span className="inline-flex items-center gap-1.5 first-letter:uppercase">
              <CalendarDays className="size-4" aria-hidden /> {formatLongDate(iso)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {p.minutes} min de leitura
            </span>
          </p>
        </div>
      </header>

      <ReadingLayout
        actions={
          <ActionBar className="grid grid-cols-2 gap-2 sm:flex"
                shareTitle={p.title}
                shareText={shareText}
                listenText={listenText}
                copy={false}
                favorite={{ key: `palavra:${p.id}`, kind: "palavra", title: p.title, subtitle: verse.label, href: `/palavra/${iso}` }}
              />
        }
        className="mt-8 lg:mt-10"
        aside={
          <>
            <DailyAside kind="palavra" />
          </>
        }
      >
        <blockquote className="verse-card p-7 md:p-9">
          <p className="font-heading text-[1.35rem] leading-relaxed italic md:text-[1.55rem]">
            “<VerseText text={verse.text} />”
          </p>
          <Link
            href={chapterHref(p.ref)}
            className="mt-4 inline-flex items-center gap-1 font-semibold text-[#d4b47c] hover:underline"
          >
            {verse.label} <ChevronRight className="size-4" />
          </Link>
        </blockquote>

        <div className="prose-reading mt-9 text-[1.12rem]">
          {p.reflection.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <Callout icon={Lightbulb} title="Para viver hoje" tone="sage">
          <p className="text-[1.05rem] leading-relaxed">{p.application}</p>
        </Callout>

        <Callout icon={Sparkles} title="Oração">
          <p className="prose-reading italic">{p.prayer}</p>
        </Callout>

        <DemoNote />
      </ReadingLayout>
    </article>
  );
}

export async function VersiculoView({ iso, isToday }: { iso: string; isToday: boolean }) {
  const v = versiculoDoDia(iso);
  const verse = await getPassage(v.ref);
  const plain = `“${plainVerse(verse.text)}” (${verse.label}, BLIVRE)`;

  return (
    <article>
      <header className="mb-8 pt-2 md:pt-0">
        <p className="eyebrow">{isToday ? "Versículo do dia" : "Versículo de " + formatLongDate(iso)}</p>
        <p className="mt-2 text-sm text-muted-foreground first-letter:uppercase">{formatLongDate(iso, true)}</p>
      </header>

      <ReadingLayout
        actions={
          <ActionBar className="grid grid-cols-2 gap-2 sm:flex"
                shareTitle={verse.label}
                shareText={plain}
                favorite={{
                  key: `versiculo:${v.id}`,
                  kind: "versiculo",
                  title: verse.label,
                  subtitle: plainVerse(verse.text).slice(0, 90),
                  href: `/versiculo/${iso}`,
                }}
              />
        }
        aside={
          <>
            <AsideCard title="Na Bíblia">
              <ListLink href={chapterHref(v.ref)} icon={BookOpen} title="Ler o capítulo inteiro" hint={formatRef({ ...v.ref, verse: undefined })} />
            </AsideCard>
            <DailyAside kind="versiculo" />
          </>
        }
      >
        <section className="verse-card px-7 py-10 md:px-12 md:py-14">
          <div className="absolute inset-0 -z-10 opacity-35">
            <Scene variant="noite" />
          </div>
          <span aria-hidden className="block font-heading text-7xl leading-none text-[#d4b47c]/50">
            “
          </span>
          <blockquote className="-mt-4 font-heading text-[1.7rem] leading-[1.5] italic md:text-[2.1rem]">
            <VerseText text={verse.text} />
          </blockquote>
          <p className="mt-6 font-heading text-2xl font-semibold text-[#d4b47c]">{verse.label}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-[1.6rem] font-semibold md:text-[1.8rem]">Contexto bíblico</h2>
          <p className="prose-reading mt-3 text-[1.1rem]">{v.context}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-[1.6rem] font-semibold md:text-[1.8rem]">Reflexão</h2>
          <p className="prose-reading mt-3 text-[1.1rem]">{v.reflection}</p>
        </section>

        <Callout icon={Lightbulb} title="Aplicação prática" tone="sage">
          <p className="text-[1.05rem] leading-relaxed">{v.application}</p>
        </Callout>

        <DemoNote />
      </ReadingLayout>
    </article>
  );
}
