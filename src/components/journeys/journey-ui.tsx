"use client";

import Link from "next/link";
import { Check, CheckCircle2, ChevronRight, Circle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Scene, type SceneVariant } from "@/components/brand/scene";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useJourneyProgress } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export function JourneyCard(props: {
  slug: string;
  title: string;
  subtitle: string;
  scene: SceneVariant;
  total: number;
  minutes: number;
}) {
  const [progress] = useJourneyProgress();
  const done = progress[props.slug]?.length ?? 0;
  const pct = Math.round((done / props.total) * 100);
  return (
    <Link
      href={`/jornadas/${props.slug}`}
      className="group overflow-hidden rounded-4xl bg-card shadow-soft ring-1 ring-border/80 transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="h-44">
        <Scene variant={props.scene} />
      </div>
      <div className="p-5">
        <h2 className="text-[1.55rem] leading-tight font-semibold">{props.title}</h2>
        <p className="text-muted-foreground">
          {props.subtitle} · {props.total} dias · {props.minutes} min/dia
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-semibold text-muted-foreground">
            {done === 0 ? "Não iniciada" : done === props.total ? "Concluída" : `Dia ${done} de ${props.total}`}
          </span>
          <span className="font-bold">{pct}%</span>
        </div>
        <Progress value={pct} className="mt-2" aria-label={`Progresso: ${pct}%`} />
      </div>
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
