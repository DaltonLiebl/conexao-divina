"use client";

import Link from "next/link";
import { CalendarDays, Check, CheckCircle2, ChevronRight, Circle, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Scene, type SceneVariant } from "@/components/brand/scene";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useJourneyProgress } from "@/lib/local-store";
import { journeyPhotos } from "@/content/jornadas";
import { cn } from "@/lib/utils";

export function JourneyCard(props: {
  slug: string;
  title: string;
  subtitle: string;
  scene: SceneVariant;
  total: number;
  minutes: number;
  className?: string;
}) {
  const [progress] = useJourneyProgress();
  const done = progress[props.slug]?.length ?? 0;
  const pct = Math.round((done / props.total) * 100);
  const nextDay = Math.min(done + 1, props.total);
  return (
    <Link
      href={done > 0 && done < props.total ? `/jornadas/${props.slug}/${nextDay}` : `/jornadas/${props.slug}`}
      className={cn(
        "group relative isolate flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-3xl p-5 text-[#f5f1e8] shadow-soft ring-1 ring-white/8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-gold/40 md:min-h-[17rem]",
        props.className,
      )}
    >
      <div className="absolute inset-0 -z-10">
        <Scene variant={props.scene} src={journeyPhotos[props.slug]} className="transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/55 to-[#0b1220]/0" />
      </div>
      <p className="text-xs text-[#f5f1e8]/70">{props.subtitle}</p>
      <h2 className="mt-1 font-heading text-[1.45rem] leading-tight font-semibold">{props.title}</h2>
      <div className="mt-4 flex items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1 text-[#f5f1e8]/80">
          <CalendarDays className="size-3.5" aria-hidden /> {props.total} dias
        </span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
          <span className="block h-full rounded-full bg-linear-to-r from-[#e8d5ac] to-[#c9a66b]" style={{ width: `${pct}%` }} />
        </span>
        <span className="font-semibold">{pct}%</span>
        <span className="grid size-9 place-items-center rounded-full bg-linear-to-br from-[#e8d5ac] to-[#c9a66b] text-[#0b1220] shadow transition-transform group-hover:scale-110">
          <Play className="ml-0.5 size-4 fill-current" aria-hidden />
        </span>
      </div>
      <span className="sr-only">
        {done === 0 ? "Não iniciada" : done === props.total ? "Concluída" : `Dia ${done} de ${props.total}`}
      </span>
    </Link>
  );
}

/** Lista de dias com marcação de concluídos. */
export function JourneyDays({ slug, days }: { slug: string; days: { title: string; label: string }[] }) {
  const [progress, setProgress] = useJourneyProgress();
  const done = new Set(progress[slug] ?? []);
  const nextDay = days.findIndex((_, i) => !done.has(i + 1)) + 1;
  const pct = Math.round((done.size / days.length) * 100);

  return (
    <>
      <div className="surface p-6">
        <div className="flex items-center justify-between font-semibold">
          <span>Seu progresso</span>
          <span>
            {done.size}/{days.length} · {pct}%
          </span>
        </div>
        <Progress value={pct} className="mt-2" />
        {nextDay > 0 ? (
          <Button className="mt-4 w-full" size="lg" render={<Link href={`/jornadas/${slug}/${nextDay}`} />} nativeButton={false}>
            {done.size === 0 ? "Começar o dia 1" : `Continuar: dia ${nextDay}`}
          </Button>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <p className="font-heading text-2xl font-semibold">Jornada concluída. Parabéns!</p>
            <Button
              variant="outline"
              onClick={() => {
                setProgress((p) => ({ ...p, [slug]: [] }));
                toast.success("Jornada reiniciada");
              }}
            >
              <RotateCcw /> Fazer de novo
            </Button>
          </div>
        )}
      </div>

      <ol className="mt-6 space-y-2">
        {days.map((d, i) => {
          const n = i + 1;
          const isDone = done.has(n);
          return (
            <li key={n}>
              <Link
                href={`/jornadas/${slug}/${n}`}
                className={cn(
                  "flex min-h-16 items-center gap-4 rounded-2xl px-4 py-3 shadow-soft ring-1 ring-border/80 transition-colors",
                  isDone ? "bg-sage/12" : "bg-card hover:bg-gold/10",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="size-7 shrink-0 text-sage-ink" aria-label="Concluído" />
                ) : (
                  <Circle className="size-7 shrink-0 text-muted-foreground/50" aria-label="Pendente" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-muted-foreground">Dia {n}</span>
                  <span className="block font-bold leading-tight">{d.title}</span>
                  <span className="block text-sm text-muted-foreground">{d.label}</span>
                </span>
                <ChevronRight className="size-5 shrink-0" />
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** Botão "Concluir o dia" com histórico de conclusão. */
export function CompleteDayButton({ slug, day, total }: { slug: string; day: number; total: number }) {
  const [progress, setProgress] = useJourneyProgress();
  const done = (progress[slug] ?? []).includes(day);
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        variant={done ? "soft" : "default"}
        className="flex-1"
        aria-pressed={done}
        onClick={() => {
          setProgress((p) => {
            const list = new Set(p[slug] ?? []);
            if (list.has(day)) list.delete(day);
            else list.add(day);
            return { ...p, [slug]: [...list].sort((a, b) => a - b) };
          });
          if (!done) toast.success(day === total ? "Você concluiu a jornada! 🙏" : `Dia ${day} concluído`);
        }}
      >
        <Check />
        {done ? "Dia concluído (desmarcar)" : "Concluir o dia"}
      </Button>
      {day < total ? (
        <Button size="lg" variant="outline" className="flex-1" render={<Link href={`/jornadas/${slug}/${day + 1}`} />} nativeButton={false}>
          Próximo dia <ChevronRight />
        </Button>
      ) : (
        <Button size="lg" variant="outline" className="flex-1" render={<Link href={`/jornadas/${slug}`} />} nativeButton={false}>
          Ver a jornada
        </Button>
      )}
    </div>
  );
}
