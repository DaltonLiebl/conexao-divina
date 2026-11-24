import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scene, type SceneVariant } from "@/components/brand/scene";

/** Título de seção: rótulo dourado + título serifado + link "ver tudo". */
export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "Ver tudo",
  className,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h2 className="text-[1.75rem] leading-tight font-semibold">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-full px-3 text-sm font-semibold text-gold-ink hover:bg-gold/10"
        >
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

/** Card principal com paisagem ao fundo e véu para leitura do texto. */
export function HeroCard({
  scene,
  imageUrl,
  imageAlt = "",
  children,
  className,
  tone = "dark",
}: {
  scene: SceneVariant;
  imageUrl?: string | null;
  imageAlt?: string;
  children: React.ReactNode;
  className?: string;
  /** dark = texto claro sobre véu escuro (padrão) */
  tone?: "dark" | "light";
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-4xl shadow-lift",
        tone === "dark" ? "text-white" : "text-foreground",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- origem configurável pelo painel
          <img src={imageUrl} alt={imageAlt} className="size-full object-cover" />
        ) : (
          <Scene variant={scene} />
        )}
        <div
          className={cn(
            "absolute inset-0",
            tone === "dark"
              ? "bg-linear-to-t from-[#0d1724]/85 via-[#0d1724]/35 to-[#0d1724]/5"
              : "bg-linear-to-t from-background/95 via-background/55 to-transparent",
          )}
        />
      </div>
      {children}
    </section>
  );
}

/** Atalho com ícone (grade da página inicial). */
export function ShortcutTile({
  href,
  icon: Icon,
  label,
  hint,
  className,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-28 flex-col justify-between rounded-3xl bg-card p-4 shadow-soft ring-1 ring-foreground/5 transition-all duration-300 ease-gentle hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-gold/12 text-gold-ink transition-colors group-hover:bg-gold/20">
        <Icon className="size-5.5" aria-hidden />
      </span>
      <span>
        <span className="block font-semibold leading-tight">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span> : null}
      </span>
    </Link>
  );
}

/** Container de página do app (largura de leitura confortável). */
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-3xl px-5 pb-32 pt-6 md:px-8 md:pb-16", className)}>{children}</div>;
}
