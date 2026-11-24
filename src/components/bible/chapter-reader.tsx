"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Heart, Share2, X, Eraser } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites, useLocalState } from "@/lib/local-store";
import { VerseText, plainVerse } from "./verse-text";

type Verse = [number, string];
type Color = "gold" | "green" | "blue" | "rose" | "lilac";

const colors: { id: Color; cls: string; label: string }[] = [
  { id: "gold", cls: "bg-hl-gold", label: "Dourado" },
  { id: "green", cls: "bg-hl-green", label: "Verde" },
  { id: "blue", cls: "bg-hl-blue", label: "Azul" },
  { id: "rose", cls: "bg-hl-rose", label: "Rosa" },
  { id: "lilac", cls: "bg-hl-lilac", label: "Lilás" },
];
const colorCls = Object.fromEntries(colors.map((c) => [c.id, c.cls])) as Record<Color, string>;
const NO_HL: Record<string, Color> = {};

export function ChapterReader({
  verses,
  bookCode,
  bookSlug,
  bookName,
  chapter,
}: {
  verses: Verse[];
  bookCode: string;
  bookSlug: string;
  bookName: string;
  chapter: number;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [highlights, setHighlights] = useLocalState<Record<string, Color>>("destaques", NO_HL);
  const { isFavorite, toggle } = useFavorites();
  const key = (v: number) => `${bookCode}:${chapter}:${v}`;

  const sorted = [...selected].sort((a, b) => a - b);
  const refLabel = sorted.length
    ? `${bookName} ${chapter}:${sorted.length > 1 && sorted.at(-1)! - sorted[0] === sorted.length - 1 ? `${sorted[0]}-${sorted.at(-1)}` : sorted.join(",")}`
    : "";
  const selText = sorted.map((n) => plainVerse(verses.find(([v]) => v === n)?.[1] ?? "")).join(" ");
  const shareText = `“${selText}” (${refLabel}, BLIVRE)`;

  const toggleVerse = (n: number) =>
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  const applyColor = (c: Color | null) => {
    setHighlights((prev) => {
      const next = { ...prev };
      for (const n of sorted) {
        if (c) next[key(n)] = c;
        else delete next[key(n)];
      }
      return next;
    });
    setSelected([]);
  };

  const favKey = `biblia:${bookCode}:${chapter}:${sorted.join(",")}`;

  return (
    <>
      <div className="prose-reading text-[1.15rem] leading-[2]">
        {verses.map(([n, text]) => {
          const hl = highlights[key(n)];
          const isSel = selected.includes(n);
          return (
            <span
              key={n}
              id={`v${n}`}
              role="button"
              tabIndex={0}
              aria-pressed={isSel}
              onClick={() => toggleVerse(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleVerse(n);
                }
              }}
              className={cn(
                "scroll-mt-24 cursor-pointer rounded-md px-0.5 transition-colors [box-decoration-break:clone]",
                hl && colorCls[hl],
                isSel && "underline decoration-gold decoration-2 underline-offset-4",
                "target:bg-hl-gold",
              )}
            >
              <sup className="mr-1 font-sans text-[0.7em] font-bold text-gold-ink">{n}</sup>
              <VerseText text={text} />{" "}
            </span>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Toque em um versículo para destacar, favoritar, copiar ou compartilhar.
      </p>

      <AnimatePresence>
        {sorted.length ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl md:left-[19rem] rounded-3xl bg-popover p-4 shadow-lift ring-1 ring-foreground/10 md:bottom-6"
            role="dialog"
            aria-label="Ações do versículo"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold">{refLabel}</p>
              <Button variant="ghost" size="icon-sm" aria-label="Fechar" onClick={() => setSelected([])}>
                <X />
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Destacar em ${c.label}`}
                  onClick={() => applyColor(c.id)}
                  className={cn("size-10 rounded-full ring-2 ring-foreground/10 transition-transform hover:scale-110", c.cls)}
                />
              ))}
              <Button variant="ghost" size="icon-sm" aria-label="Remover destaque" onClick={() => applyColor(null)}>
                <Eraser />
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button
                variant={isFavorite(favKey) ? "soft" : "outline"}
                size="sm"
                onClick={() => {
                  const added = toggle({
                    key: favKey,
                    kind: "biblia",
                    title: refLabel,
                    subtitle: selText.slice(0, 90),
                    href: `/biblia/${bookSlug}/${chapter}#v${sorted[0]}`,
                  });
                  toast.success(added ? "Salvo nos favoritos" : "Removido dos favoritos");
                }}
              >
                <Heart /> Favoritar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareText);
                    toast.success("Versículo copiado");
                  } catch {
                    toast.error("Não foi possível copiar.");
                  }
                }}
              >
                <Copy /> Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: refLabel, text: shareText });
                      return;
                    } catch (e) {
                      if ((e as Error).name === "AbortError") return;
                    }
                  }
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener");
                }}
              >
                <Share2 /> Enviar
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
