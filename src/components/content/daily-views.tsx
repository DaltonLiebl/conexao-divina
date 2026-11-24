import Link from "next/link";
import { BookOpen, CalendarDays, ChevronRight, Clock, Lightbulb, Sparkles } from "lucide-react";
import { Scene } from "@/components/brand/scene";
import { VerseText, plainVerse } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { getPassage } from "@/lib/bible/server";
import { chapterHref } from "@/lib/bible/books";
import { formatLongDate, palavraDoDia, versiculoDoDia } from "@/lib/daily";

/** Nota exigida: conteúdo inicial demonstrativo identificado. */
export function DemoNote() {
  return (
    <p className="mt-10 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
      Conteúdo inicial do Conexão Divina. Textos bíblicos da Bíblia Livre (BLIVRE), licença CC BY 4.0.
    </p>
  );
}

export async function PalavraView({ iso, isToday }: { iso: string; isToday: boolean }) {
  const p = palavraDoDia(iso);
  const verse = await getPassage(p.ref);
  const href = isToday ? "/palavra" : `/palavra/${iso}`;
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
      <div className="relative -mx-5 h-56 overflow-hidden md:mx-0 md:rounded-4xl">
        <Scene variant={p.scene} />
        
      </div>
      <div className="relative mt-5">
        <p className="eyebrow">{isToday ? "Palavra do dia" : "Palavra de " + formatLongDate(iso)}</p>
        <h1 className="mt-1 text-[2.4rem] leading-[1.08] font-semibold">{p.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 first-letter:uppercase">
            <CalendarDays className="size-4" /> {formatLongDate(iso)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" /> {p.minutes} min de leitura
          </span>
        </p>
      </div>

      <ActionBar
        className="mt-5"
        shareTitle={p.title}
        shareText={shareText}
        listenText={listenText}
        copy={false}
        favorite={{ key: `palavra:${p.id}`, kind: "palavra", title: p.title, subtitle: verse.label, href: `/palavra/${iso}` }}
      />

      <blockquote className="mt-8 border-l-4 border-gold pl-5">
        <p className="font-reading text-[1.3rem] leading-relaxed italic">
          “<VerseText text={verse.text} />”
        </p>
        <Link href={chapterHref(p.ref)} className="mt-2 inline-flex items-center gap-1 font-semibold text-gold-ink hover:underline">
          {verse.label} <ChevronRight className="size-4" />
        </Link>
      </blockquote>

      <div className="prose-reading mt-8">
        {p.reflection.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <section className="mt-8 rounded-3xl bg-sage/12 p-5">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-sage-ink">
          <Lightbulb className="size-5" /> Para viver hoje
        </h2>
        <p className="mt-2 text-[1.05rem] leading-relaxed">{p.application}</p>
      </section>

      <section className="mt-5 rounded-3xl bg-gold/12 p-5">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-gold-ink">
          <Sparkles className="size-5" /> Oração
        </h2>
        <p className="prose-reading mt-2 italic">{p.prayer}</p>
      </section>

      <DailyFooter kind="palavra" current={href} />
      <DemoNote />
    </article>
  );
}

export async function VersiculoView({ iso, isToday }: { iso: string; isToday: boolean }) {
  const v = versiculoDoDia(iso);
  const verse = await getPassage(v.ref);
  const plain = `“${plainVerse(verse.text)}” (${verse.label}, BLIVRE)`;

  return (
    <article>
      <p className="eyebrow">{isToday ? "Versículo do dia" : "Versículo de " + formatLongDate(iso)}</p>
      <p className="mt-1 text-sm first-letter:uppercase text-muted-foreground">{formatLongDate(iso, true)}</p>

      <section className="relative isolate mt-4 overflow-hidden rounded-4xl p-7 text-white shadow-lift md:p-10">
        <div className="absolute inset-0 -z-10">
          <Scene variant="noite" />
          <div className="absolute inset-0 bg-[#0d1724]/45" />
        </div>
        <blockquote className="font-reading text-[1.55rem] leading-relaxed md:text-[1.8rem]">
          “<VerseText text={verse.text} />”
        </blockquote>
        <p className="mt-5 font-heading text-2xl font-semibold text-[#e3c995]">{verse.label}</p>
      </section>

      <ActionBar
        className="mt-5"
        shareTitle={verse.label}
        shareText={plain}
        favorite={{ key: `versiculo:${v.id}`, kind: "versiculo", title: verse.label, subtitle: plainVerse(verse.text).slice(0, 90), href: `/versiculo/${iso}` }}
      />

      <section className="mt-8">
        <h2 className="text-[1.7rem] font-semibold">Contexto bíblico</h2>
        <p className="prose-reading mt-2">{v.context}</p>
        <Link
          href={chapterHref(v.ref)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-muted px-4 font-semibold hover:bg-secondary"
        >
          <BookOpen className="size-4" /> Ler o capítulo inteiro
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="text-[1.7rem] font-semibold">Reflexão</h2>
        <p className="prose-reading mt-2">{v.reflection}</p>
      </section>

      <section className="mt-8 rounded-3xl bg-sage/12 p-5">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-sage-ink">
          <Lightbulb className="size-5" /> Aplicação prática
        </h2>
        <p className="mt-2 text-[1.05rem] leading-relaxed">{v.application}</p>
      </section>

      <DailyFooter kind="versiculo" current={isToday ? "/versiculo" : `/versiculo/${iso}`} />
      <DemoNote />
    </article>
  );
}

function DailyFooter({ kind, current }: { kind: "palavra" | "versiculo"; current: string }) {
  const other = kind === "palavra" ? { href: "/versiculo", label: "Versículo do dia" } : { href: "/palavra", label: "Palavra do dia" };
  return (
    <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Mais conteúdos">
      <Link
        href={other.href === current ? "/inicio" : other.href}
        className="flex min-h-14 items-center justify-between rounded-2xl bg-card px-5 font-semibold shadow-soft ring-1 ring-foreground/5"
      >
        {other.label} <ChevronRight className="size-4" />
      </Link>
      <Link
        href="/anteriores"
        className="flex min-h-14 items-center justify-between rounded-2xl bg-card px-5 font-semibold shadow-soft ring-1 ring-foreground/5"
      >
        Dias anteriores <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
