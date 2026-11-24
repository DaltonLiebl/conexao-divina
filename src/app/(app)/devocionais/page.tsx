import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, BookMarked, Clock, Sun } from "lucide-react";
import { Scene } from "@/components/brand/scene";
import { PageHeader } from "@/components/ds/layout";
import { HISTORY_DAYS, addDays, formatLongDate, formatShortDate, palavraDoDia, todayISO, versiculoDoDia } from "@/lib/daily";
import { formatRef } from "@/lib/bible/books";

export const metadata: Metadata = { title: "Devocionais" };

export default async function DevocionaisPage() {
  await connection();
  const today = todayISO();
  const hoje = palavraDoDia(today);
  const versoHoje = versiculoDoDia(today);
  const days = Array.from({ length: HISTORY_DAYS }, (_, i) => addDays(today, -(i + 1)));

  return (
    <div className="page">
      <PageHeader
        eyebrow="Devocionais"
        title="Um encontro com Deus a cada dia"
        lead={`A Palavra e o Versículo de hoje e dos últimos ${HISTORY_DAYS} dias, para ler e reler com calma.`}
      />

      {/* Hoje */}
      <section aria-labelledby="hoje-titulo" className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Link
          href="/palavra"
          className="group relative isolate flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-4xl p-7 text-[#f5f1e8] shadow-lift ring-1 ring-white/5 md:p-9 lg:col-span-8"
        >
          <div className="absolute inset-0 -z-10">
            <Scene variant={hoje.scene} />
            <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/50 to-transparent" />
          </div>
          <p id="hoje-titulo" className="eyebrow text-[#e8d5ac]">
            Hoje · Palavra do dia
          </p>
          <h2 className="mt-2 text-[2rem] leading-tight font-semibold md:text-[2.5rem]">{hoje.title}</h2>
          <p className="mt-3 flex items-center gap-4 text-sm text-[#f5f1e8]/75">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {hoje.minutes} min
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#d4b47c]">
              Ler agora <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </p>
        </Link>
        <Link href="/versiculo" className="verse-card group flex flex-col justify-between p-7 md:p-9 lg:col-span-4">
          <span>
            <p className="eyebrow text-[#e8d5ac]">Hoje · Versículo do dia</p>
            <p className="mt-4 font-heading text-[2rem] leading-tight font-semibold">{formatRef(versoHoje.ref)}</p>
          </span>
          <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-[#d4b47c]">
            Contexto e reflexão <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {/* Dias anteriores */}
      <section aria-labelledby="anteriores-titulo" className="mt-14">
        <h2 id="anteriores-titulo" className="mb-5 text-[1.6rem] font-semibold md:text-[1.85rem]">
          Dias anteriores
        </h2>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.map((iso, i) => {
            const p = palavraDoDia(iso);
            const v = versiculoDoDia(iso);
            return (
              <li key={iso} className="surface flex flex-col p-5">
                <p className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold text-foreground first-letter:uppercase">
                    {i === 0 ? "Ontem" : formatLongDate(iso).split(",")[0]}
                  </span>
                  <span className="text-muted-foreground">{formatShortDate(iso)}</span>
                </p>
                <div className="mt-3 space-y-2">
                  <Link
                    href={`/palavra/${iso}`}
                    className="flex min-h-14 items-center gap-3 rounded-2xl bg-background-2/70 px-3.5 py-2.5 ring-1 ring-border/60 transition-colors hover:bg-accent hover:ring-gold/30"
                  >
                    <Sun className="size-5 shrink-0 text-gold" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Palavra
                      </span>
                      <span className="block truncate font-medium">{p.title}</span>
                    </span>
                  </Link>
                  <Link
                    href={`/versiculo/${iso}`}
                    className="flex min-h-14 items-center gap-3 rounded-2xl bg-background-2/70 px-3.5 py-2.5 ring-1 ring-border/60 transition-colors hover:bg-accent hover:ring-gold/30"
                  >
                    <BookMarked className="size-5 shrink-0 text-sage-ink" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Versículo
                      </span>
                      <span className="block truncate font-medium">{formatRef(v.ref)}</span>
                    </span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
