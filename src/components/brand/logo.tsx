import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

/**
 * Símbolo: o sol nascendo no horizonte, com uma cruz de luz no centro.
 * "Encontro diário" = cada manhã é um novo começo com Deus.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-10", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <g fill="none" strokeLinecap="round">
        {/* raios */}
        <g stroke="var(--gold)" strokeWidth="2.2">
          <path d="M24 6.5v4.5" />
          <path d="M11.6 11.6l3.2 3.2" />
          <path d="M36.4 11.6l-3.2 3.2" />
          <path d="M5.5 24h4.5" />
          <path d="M42.5 24H38" />
        </g>
        {/* sol */}
        <path d="M12.5 33a11.5 11.5 0 0 1 23 0" fill="var(--gold)" />
        {/* cruz de luz */}
        <path d="M24 24.5v8.5M20.5 27.5h7" stroke="var(--background)" strokeWidth="2.2" />
        {/* horizonte */}
        <path d="M6 33h36" stroke="currentColor" strokeWidth="2.4" />
        <path d="M13 38.5h22" stroke="currentColor" strokeWidth="2.4" opacity="0.45" />
      </g>
    </svg>
  );
}

export function Logo({ className, showSlogan = false }: { className?: string; showSlogan?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-primary", className)}>
      <LogoMark className="size-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[1.6rem] font-semibold tracking-tight text-foreground">
          {brand.name}
        </span>
        {showSlogan ? (
          <span className="mt-1 text-xs font-medium tracking-wide text-muted-foreground">{brand.slogan}</span>
        ) : null}
      </span>
    </span>
  );
}
