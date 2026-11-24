"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookOpen, CheckCircle2, ChevronRight, Flag, Flame } from "lucide-react";
import { recordActivity, useActivity, useJourneyProgress, type Activity } from "@/lib/local-store";
import { addDays, todayISO } from "@/lib/daily";
import { cn } from "@/lib/utils";
import { jornadas } from "@/content/jornadas";

/** Meta semanal: dias com algum momento com Deus. */
export const WEEKLY_GOAL = 5;

export function computeStats(a: Activity, today: string) {
  const set = new Set(a.days);
  let streak = 0;
  let d = set.has(today) ? today : addDays(today, -1);
  while (set.has(d)) {
    streak++;
    d = addDays(d, -1);
  }
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay(); // 0 = domingo
  const monday = addDays(today, -((dow + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const weekActive = week.filter((x) => set.has(x)).length;
  return {
    streak,
    prayers: a.prayers.length,
    devotionals: a.devotionals.length,
    totalDays: a.days.length,
    week: week.map((iso) => ({ iso, active: set.has(iso), isToday: iso === today, future: iso > today })),
    weekActive,
    weekPct: Math.min(100, Math.round((weekActive / WEEKLY_GOAL) * 100)),
  };
}

/** Registra a atividade ao abrir a tela (uma vez por conteúdo por dia). */
export function TrackActivity({ kind, id }: { kind: "dia" | "oracao" | "devocional"; id?: string }) {
  const [, setActivity] = useActivity();
  useEffect(() => {
    recordActivity(setActivity, todayISO(), kind, id);
  }, [kind, id, setActivity]);
  return null;
}

function useStats() {
  const [activity] = useActivity();
  const [journeys] = useJourneyProgress();
  const stats = computeStats(activity, todayISO());
  const activeJourneys = jornadas.filter((j) => {
    const done = journeys[j.slug]?.length ?? 0;
    return done > 0 && done < j.days.length;
  }).length;
  return { ...stats, activeJourneys };
}

/** Anel do "dias consecutivos". */
export function StreakRing({ streak, size = "md" }: { streak: number; size?: "md" | "lg" }) {
  const pct = Math.min(1, streak / 7);
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative shrink-0", size === "lg" ? "size-44" : "size-32")}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-border" />
        {streak ? (
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#anel-ouro)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(pct * c, 6)} ${c}`}
        />
        ) : null}
        <defs>
          <linearGradient id="anel-ouro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8d5ac" />
            <stop offset="100%" stopColor="#c9a66b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <Flame className={cn("mx-auto text-gold", size === "lg" ? "size-7" : "size-5")} aria-hidden />
        <span className={cn("font-heading leading-none font-semibold", size === "lg" ? "mt-1 text-5xl" : "mt-0.5 text-3xl")}>
          {streak}
        </span>
        <span className="mt-1 text-[0.62rem] leading-tight text-muted-foreground">
          {streak === 1 ? "dia" : "dias"}
          <br />
          {streak === 1 ? "consecutivo" : "consecutivos"}
        </span>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: typeof Flag; label: string; value: number }) {
  return (
    <li className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0">
      <Icon className="size-[1.1rem] shrink-0 text-gold" aria-hidden />
      <span className="flex-1 text-[0.92rem] text-muted-foreground">{label}</span>
      <span className="font-heading text-lg font-semibold">{value}</span>
    </li>
  );
}

export function WeeklyGoal({ weekActive, weekPct }: { weekActive: number; weekPct: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">Minha meta semanal</span>
        <span className="font-heading text-lg font-semibold text-gold-ink">{weekPct}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={weekPct} aria-valuemin={0} aria-valuemax={100} aria-label="Meta semanal">
        <div className="h-full rounded-full bg-linear-to-r from-[#e8d5ac] to-[#c9a66b] transition-all" style={{ width: `${weekPct}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {weekActive} de {WEEKLY_GOAL} dias com Deus nesta semana
      </p>
    </div>
  );
}

/** Card "Meu progresso espiritual" da página inicial. */
export function ProgressCard({ className }: { className?: string }) {
  const s = useStats();
  return (
    <section className={cn("surface flex flex-col p-6", className)} aria-labelledby="progresso-titulo">
      <Link href="/progresso" className="group -m-1 flex items-center justify-between rounded-xl p-1">
        <h2 id="progresso-titulo" className="flex items-center gap-2.5 font-heading text-xl font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-gold/12 text-gold">
            <Flame className="size-4.5" aria-hidden />
          </span>
          Meu progresso espiritual
        </h2>
        <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
      <div className="mt-4 flex flex-1 flex-col items-center gap-4 min-[420px]:flex-row min-[420px]:gap-5">
        <StreakRing streak={s.streak} />
        <ul className="w-full min-w-0 flex-1">
          <StatRow icon={CheckCircle2} label="Orações realizadas" value={s.prayers} />
          <StatRow icon={BookOpen} label="Devocionais lidos" value={s.devotionals} />
          <StatRow icon={Flag} label="Jornadas em andamento" value={s.activeJourneys} />
        </ul>
      </div>
      <div className="mt-5">
        <WeeklyGoal weekActive={s.weekActive} weekPct={s.weekPct} />
      </div>
    </section>
  );
}

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** Conteúdo da página /progresso. */
export function ProgressOverview() {
  const s = useStats();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="surface flex flex-col items-center gap-8 p-7 sm:flex-row md:p-9 lg:col-span-7">
        <StreakRing streak={s.streak} size="lg" />
        <div className="w-full flex-1">
          <ul>
            <StatRow icon={CheckCircle2} label="Orações realizadas" value={s.prayers} />
            <StatRow icon={BookOpen} label="Devocionais lidos" value={s.devotionals} />
            <StatRow icon={Flag} label="Jornadas em andamento" value={s.activeJourneys} />
            <StatRow icon={Flame} label="Dias com Deus (total)" value={s.totalDays} />
          </ul>
        </div>
      </section>

      <section className="surface p-7 md:p-9 lg:col-span-5">
        <h2 className="font-heading text-xl font-semibold">Esta semana</h2>
        <ol className="mt-5 grid grid-cols-7 gap-2">
          {s.week.map((d, i) => (
            <li key={d.iso} className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{WEEKDAYS[i]}</span>
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full text-sm font-semibold ring-1",
                  d.active
                    ? "bg-linear-to-br from-[#e8d5ac] to-[#c9a66b] text-[#0b1220] ring-transparent"
                    : d.future
                      ? "text-muted-foreground/50 ring-border/50"
                      : "text-muted-foreground ring-border",
                  d.isToday && !d.active && "ring-2 ring-gold/60",
                )}
                aria-label={`${WEEKDAYS[i]}: ${d.active ? "com atividade" : "sem atividade"}`}
              >
                {Number(d.iso.slice(8))}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-7">
          <WeeklyGoal weekActive={s.weekActive} weekPct={s.weekPct} />
        </div>
      </section>
    </div>
  );
}
