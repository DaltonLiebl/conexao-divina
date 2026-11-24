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
  id,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
        <h2 id={id} className="text-[1.6rem] leading-tight font-semibold md:text-[1.85rem]">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-full px-3 text-sm font-medium text-gold-ink transition-colors hover:bg-gold/10"
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
        "relative isolate overflow-hidden rounded-4xl shadow-lift ring-1 ring-white/5",
        tone === "dark" ? "text-[#f5f1e8]" : "text-foreground",
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
              ? "bg-linear-to-t from-[#0b1220]/92 via-[#0b1220]/45 to-[#0b1220]/5"
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
    <Link href={href} className={cn("surface surface-link group flex min-h-32 flex-col justify-between p-5", className)}>
      <span className="grid size-11 place-items-center rounded-2xl bg-gold/12 text-gold ring-1 ring-gold/20 transition-colors group-hover:bg-gold/20">
        <Icon className="size-5.5" aria-hidden />
      </span>
      <span>
        <span className="block font-semibold leading-tight">{label}</span>
        {hint ? <span className="mt-1 block text-sm text-muted-foreground">{hint}</span> : null}
      </span>
    </Link>
  );
}

/** Container de página do app (largo no computador). */
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("page", className)}>{children}</div>;
}

/** Cabeçalho de página: rótulo, título e descrição, com ação opcional à direita. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 flex flex-col gap-5 pt-6 md:pt-0 lg:mb-10 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title mt-2">{title}</h1>
        {lead ? <p className="page-lead">{lead}</p> : null}
      </div>
      {children ? <div className="shrink-0 lg:min-w-[24rem]">{children}</div> : null}
    </header>
  );
}

/**
 * Leitura com coluna lateral (computador): texto numa largura confortável
 * e, ao lado, ações e conteúdos relacionados. No celular, tudo empilhado.
 */
export function ReadingLayout({
  children,
  aside,
  actions,
  className,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  /** Favoritar, ouvir, copiar, compartilhar: no topo do texto no celular, na lateral no computador. */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14",
        className,
      )}
    >
      <div className="min-w-0 max-w-[46rem]">
        {actions ? <div className="mb-8 lg:hidden">{actions}</div> : null}
        {children}
      </div>
      {aside || actions ? (
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          {actions ? (
            <AsideCard title="Ações" className="hidden lg:block">
              {actions}
            </AsideCard>
          ) : null}
          {aside}
        </aside>
      ) : null}
    </div>
  );
}

/** Card lateral com título pequeno. */
export function AsideCard({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("surface p-5", className)}>
      {title ? <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2> : null}
      {children}
    </section>
  );
}

/** Link de lista (setinha à direita), usado nas colunas laterais. */
export function ListLink({
  href,
  icon: Icon,
  title,
  hint,
}: {
  href: string;
  icon?: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group -mx-2 flex min-h-12 items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-accent"
    >
      {Icon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
          <Icon className="size-[1.15rem]" aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight">{title}</span>
        {hint ? <span className="block truncate text-sm text-muted-foreground">{hint}</span> : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
