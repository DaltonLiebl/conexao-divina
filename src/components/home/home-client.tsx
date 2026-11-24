"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BookOpen, ChevronRight, Map, Moon, Sunrise } from "lucide-react";
import { useJourneyProgress, useLastReading } from "@/lib/local-store";
import { Progress } from "@/components/ui/progress";

const noop = () => () => {};
const useHour = () =>
  useSyncExternalStore(
    noop,
    () => new Date().getHours(),
    () => 8,
  );

type PrayerLink = { slug: string; title: string; summary: string };

/** Oração da manhã (5h–17h) ou da noite, conforme a hora do aparelho. */
export function MomentPrayer({ morning, night }: { morning: PrayerLink; night: PrayerLink }) {
  const hour = useHour();
  const isMorning = hour >= 5 && hour < 17;
  const p = isMorning ? morning : night;
  const Icon = isMorning ? Sunrise : Moon;
  return (
    <Link
      href={`/oracoes/${p.slug}`}
      className="group flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold-ink">
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block">{isMorning ? "Oração da manhã" : "Oração da noite"}</span>
        <span className="mt-0.5 block font-heading text-[1.45rem] leading-tight font-semibold">{p.title}</span>
        <span className="block text-muted-foreground">{p.summary}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

type JourneyInfo = { slug: string; title: string; total: number };

/** "Continuar": última leitura da Bíblia e jornada em andamento. */
export function ContinueSection({ journeys }: { journeys: JourneyInfo[] }) {
  const [last] = useLastReading();
  const [progress] = useJourneyProgress();
  const active = journeys
    .map((j) => ({ ...j, done: progress[j.slug]?.length ?? 0 }))
    .filter((j) => j.done > 0 && j.done < j.total);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link
        href={last ? `/biblia/${last.book}/${last.chapter}` : "/biblia/genesis/1"}
        className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-ink">
          <BookOpen className="size-6" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-muted-foreground">
            {last ? "Continuar leitura" : "Começar a ler a Bíblia"}
          </span>
          <span className="block truncate text-lg font-bold">{last ? last.label : "Gênesis 1"}</span>
        </span>
      </Link>
      {active.length ? (
        active.slice(0, 1).map((j) => (
          <Link
            key={j.slug}
            href={`/jornadas/${j.slug}`}
            className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Jornada em andamento</span>
              <span className="text-sm font-bold">
                {j.done}/{j.total}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-lg font-bold">{j.title}</span>
            <Progress value={(j.done / j.total) * 100} className="mt-3" aria-label="Progresso da jornada" />
          </Link>
        ))
      ) : (
        <Link
          href="/jornadas"
          className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold-ink">
            <Map className="size-6" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-muted-foreground">Jornadas espirituais</span>
            <span className="block truncate text-lg font-bold">Comece um plano de 7 dias</span>
          </span>
        </Link>
      )}
    </div>
  );
}
