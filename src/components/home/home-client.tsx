"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BookOpen, ChevronRight, Map, Moon, Sunrise } from "lucide-react";
import { useJourneyProgress, useLastReading } from "@/lib/local-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const noop = () => () => {};
const useHour = () =>
  useSyncExternalStore(
    noop,
    () => new Date().getHours(),
    () => 8,
  );

type PrayerLink = { slug: string; title: string; summary: string };

/** Oração da manhã (5h–17h) ou da noite, conforme a hora do aparelho. */
export function MomentPrayer({
  morning,
  night,
  className,
}: {
  morning: PrayerLink;
  night: PrayerLink;
  className?: string;
}) {
  const hour = useHour();
  const isMorning = hour >= 5 && hour < 17;
  const p = isMorning ? morning : night;
  const Icon = isMorning ? Sunrise : Moon;
  return (
    <Link href={`/oracoes/${p.slug}`} className={cn("surface surface-link group flex items-center gap-4 p-5", className)}>
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gold/12 text-gold ring-1 ring-gold/20">
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block">{isMorning ? "Oração da manhã" : "Oração da noite"}</span>
        <span className="mt-1 block font-heading text-[1.35rem] leading-tight font-semibold">{p.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[0.95rem] text-muted-foreground">{p.summary}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

type JourneyInfo = { slug: string; title: string; total: number };

/** "Continuar": última leitura da Bíblia e jornada em andamento (dois cards). */
export function ContinueSection({ journeys }: { journeys: JourneyInfo[] }) {
  const [last] = useLastReading();
  const [progress] = useJourneyProgress();
  const active = journeys
    .map((j) => ({ ...j, done: progress[j.slug]?.length ?? 0 }))
    .filter((j) => j.done > 0 && j.done < j.total);
  const j = active[0];

  return (
    <>
      <Link
        href={last ? `/biblia/${last.book}/${last.chapter}` : "/biblia/genesis/1"}
        className="surface surface-link group flex items-center gap-4 p-5"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-ink">
          <BookOpen className="size-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-muted-foreground">{last ? "Continuar leitura" : "Começar a ler a Bíblia"}</span>
          <span className="block truncate font-heading text-xl font-semibold">{last ? last.label : "Gênesis 1"}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
      {j ? (
        <Link href={`/jornadas/${j.slug}`} className="surface surface-link block p-5">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Jornada em andamento</span>
            <span className="text-sm font-semibold text-gold-ink">
              {j.done}/{j.total}
            </span>
          </span>
          <span className="mt-0.5 block truncate font-heading text-xl font-semibold">{j.title}</span>
          <Progress value={(j.done / j.total) * 100} className="mt-3" aria-label="Progresso da jornada" />
        </Link>
      ) : (
        <Link href="/jornadas" className="surface surface-link group flex items-center gap-4 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold/12 text-gold">
            <Map className="size-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-muted-foreground">Jornadas espirituais</span>
            <span className="block truncate font-heading text-xl font-semibold">Comece um plano de 7 dias</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </>
  );
}
