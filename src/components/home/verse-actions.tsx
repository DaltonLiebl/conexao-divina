"use client";

import { Copy, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useFavorites, type Favorite } from "@/lib/local-store";
import { cn } from "@/lib/utils";

/** Copiar, compartilhar e favoritar (versão compacta, usada sobre fotos). */
export function VerseQuickActions({
  text,
  title,
  favorite,
  className,
  tone = "light",
}: {
  text: string;
  title: string;
  favorite: Omit<Favorite, "savedAt">;
  className?: string;
  /** light = texto escuro (sobre foto clara) */
  tone?: "light" | "dark";
}) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(favorite.key);
  const btn = cn(
    "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
    tone === "light" ? "text-[#1d2a3f] hover:bg-[#0b1220]/8" : "text-[#f5f1e8]/85 hover:bg-white/10",
  );
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1 gap-y-1", className)}>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            toast.success("Versículo copiado");
          } catch {
            toast.error("Não foi possível copiar neste aparelho.");
          }
        }}
      >
        <Copy className="size-4" aria-hidden /> Copiar
      </button>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          const url = window.location.origin + favorite.href;
          if (navigator.share) {
            try {
              await navigator.share({ title, text: `${text}\n\n${url}` });
              return;
            } catch (e) {
              if ((e as Error).name === "AbortError") return;
            }
          }
          window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`, "_blank", "noopener");
        }}
      >
        <Share2 className="size-4" aria-hidden /> Compartilhar
      </button>
      <button
        type="button"
        className={btn}
        aria-pressed={on}
        onClick={() => {
          const added = toggle(favorite);
          toast.success(added ? "Salvo nos seus favoritos" : "Removido dos favoritos");
        }}
      >
        <Heart className={cn("size-4", on && "fill-current text-rose-600")} aria-hidden /> {on ? "Salvo" : "Favoritar"}
      </button>
    </div>
  );
}

/** Coração pequeno para favoritar (canto dos cards). */
export function FavoriteHeart({ favorite, className }: { favorite: Omit<Favorite, "savedAt">; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(favorite.key);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remover dos favoritos" : "Salvar nos favoritos"}
      onClick={(e) => {
        e.preventDefault();
        const added = toggle(favorite);
        toast.success(added ? "Salvo nos seus favoritos" : "Removido dos favoritos");
      }}
      className={cn(
        "grid size-10 place-items-center rounded-full text-gold transition-colors hover:bg-gold/12",
        className,
      )}
    >
      <Heart className={cn("size-5", on && "fill-current")} aria-hidden />
    </button>
  );
}
