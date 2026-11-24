import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

/**
 * Símbolo: a Bíblia aberta, com a cruz e raios de luz nascendo dela.
 * "Encontro diário" = a Palavra iluminando cada novo dia.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      className={cn("h-10 w-auto", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <g fill="none" strokeLinecap="round" stroke="#d9bd86">
        {/* raios (cor sólida: gradientes com id quebram quando há dois logos e um está oculto) */}
        <g strokeWidth="2">
          <path d="M14 15.5l3.2 2.4" />
          <path d="M50 15.5l-3.2 2.4" />
          <path d="M20.5 8.5l2 3" />
          <path d="M43.5 8.5l-2 3" />
          <path d="M8.5 24h4" />
          <path d="M55.5 24h-4" />
        </g>
        {/* cruz */}
        <path d="M32 3v18M26.5 8.5h11" strokeWidth="2.6" />
      </g>
      {/* brilho atrás do livro */}
      <path d="M20 31a12 9 0 0 1 24 0" fill="#d9bd86" opacity="0.35" />
      {/* livro aberto */}
      <path
        d="M32 29.5c-5-3.4-12.5-4.4-21-3.2v15.2c8.5-1.2 16 -0.2 21 3.2c5-3.4 12.5-4.4 21-3.2V26.3c-8.5-1.2-16-.2-21 3.2z"
        fill="#d9bd86"
      />
      <path d="M32 29.5v15.2" stroke="var(--background)" strokeWidth="1.6" />
      <g stroke="var(--background)" strokeWidth="1" opacity="0.55" strokeLinecap="round">
        <path d="M15 30.2c4.6-.4 9 .3 13 2" />
        <path d="M15 34.2c4.6-.4 9 .3 13 2" />
        <path d="M49 30.2c-4.6-.4-9 .3-13 2" />
        <path d="M49 34.2c-4.6-.4-9 .3-13 2" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  showSlogan = false,
  compact = false,
  stacked = false,
}: {
  className?: string;
  showSlogan?: boolean;
  /** versão menor (cabeçalho do celular) */
  compact?: boolean;
  /** símbolo em cima, nome embaixo (menu lateral) */
  stacked?: boolean;
}) {
  return (
    <span
      className={cn(
        stacked ? "inline-flex flex-col items-center text-center" : "inline-flex items-center gap-2.5",
        className,
      )}
    >
      <LogoMark className={cn("shrink-0", stacked ? "h-14" : compact ? "h-8" : "h-10")} />
      <span className={cn("flex min-w-0 flex-col leading-none", stacked && "mt-2 items-center")}>
        <span
          className={cn(
            "font-heading font-semibold tracking-tight whitespace-nowrap text-foreground",
            stacked ? "text-[1.45rem]" : compact ? "text-[1.15rem]" : "text-[1.5rem]",
          )}
        >
          {brand.name}
        </span>
        {showSlogan ? (
          <span className="mt-1.5 truncate text-[0.72rem] font-medium tracking-wide text-muted-foreground">
            {brand.slogan}
          </span>
        ) : null}
      </span>
    </span>
  );
}
