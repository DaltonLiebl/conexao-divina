import { Crown, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Selo de conteúdo premium. */
export function PremiumBadge({ className, label = "Premium" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold-ink",
        className,
      )}
    >
      <Crown className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

/**
 * Identifica conteúdo demonstrativo (exigência: conteúdos iniciais de
 * demonstração devem ser identificados até serem substituídos pelo administrador).
 */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      title="Conteúdo de demonstração. Será substituído pelo conteúdo oficial."
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-sage/15 px-2.5 py-1 text-xs font-bold text-sage-ink",
        className,
      )}
    >
      <FlaskConical className="size-3.5" aria-hidden />
      Demonstração
    </span>
  );
}
