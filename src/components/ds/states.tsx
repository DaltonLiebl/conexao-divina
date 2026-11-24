import Link from "next/link";
import { AlertCircle, type LucideIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Estado vazio acolhedor: ícone, frase, explicação e (opcional) uma ação real. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="mb-4 grid size-16 place-items-center rounded-full bg-gold/12 text-gold-ink">
        <Icon className="size-7" aria-hidden />
      </span>
      <h3 className="text-2xl font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-muted-foreground">{description}</p> : null}
      {action ? (
        <div className="mt-6">
          {"href" in action ? (
            <Button render={<Link href={action.href} />} nativeButton={false}>
              {action.label}
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Erro amigável, com tentar novamente quando houver como. */
export function ErrorState({
  title = "Não foi possível carregar",
  description = "Verifique sua conexão com a internet e tente de novo.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-3xl border border-destructive/25 bg-destructive/5 px-6 py-8 text-center",
        className,
      )}
    >
      <AlertCircle className="mb-3 size-8 text-destructive" aria-hidden />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          <RotateCcw /> Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

/** Esqueletos com o formato dos cards reais. */
export function CardSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("rounded-3xl bg-card p-5 shadow-soft", className)} aria-hidden>
      <Skeleton className="mb-4 h-3 w-24 rounded-full" />
      <Skeleton className="mb-3 h-7 w-3/4 rounded-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("mb-2 h-4 rounded-md", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function PageLoading({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-56 w-full rounded-4xl" />
      <CardSkeleton />
      <CardSkeleton lines={2} />
    </div>
  );
}
