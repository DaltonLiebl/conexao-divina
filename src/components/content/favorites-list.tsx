"use client";

import Link from "next/link";
import { useState } from "react";
import { BookMarked, BookOpen, HandHeart, Heart, Smile, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ds/states";
import { useFavorites, type FavoriteKind } from "@/lib/local-store";
import { useIsClient } from "@/components/appearance/appearance-provider";
import { cn } from "@/lib/utils";

const kinds: { id: FavoriteKind | "todos"; label: string; icon: typeof Heart }[] = [
  { id: "todos", label: "Todos", icon: Heart },
  { id: "palavra", label: "Palavras", icon: Sun },
  { id: "versiculo", label: "Versículos", icon: BookMarked },
  { id: "biblia", label: "Bíblia", icon: BookOpen },
  { id: "oracao", label: "Orações", icon: HandHeart },
  { id: "sentimento", label: "Coração", icon: Smile },
];
const iconFor = Object.fromEntries(kinds.map((k) => [k.id, k.icon])) as Record<string, typeof Heart>;

export function FavoritesList() {
  const { list, remove } = useFavorites();
  const [filter, setFilter] = useState<FavoriteKind | "todos">("todos");
  const ready = useIsClient();
  if (!ready) return null;

  if (!list.length)
    return (
      <EmptyState
        className="mt-6"
        icon={Heart}
        title="Nenhum favorito ainda"
        description="Toque em Favoritar numa Palavra, num Versículo, numa oração ou num versículo da Bíblia para guardar aqui."
        action={{ label: "Ver a Palavra do dia", href: "/palavra" }}
      />
    );

  const shown = filter === "todos" ? list : list.filter((f) => f.kind === filter);
  return (
    <>
      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        {kinds.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={filter === k.id}
            onClick={() => setFilter(k.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-4 font-semibold ring-1 transition-colors",
              filter === k.id ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
      {shown.length ? (
        <ul className="mt-4 space-y-3">
          {shown.map((f) => {
            const Icon = iconFor[f.kind] ?? Heart;
            return (
              <li key={f.key} className="flex items-center gap-2 rounded-3xl bg-card p-2 pl-4 shadow-soft ring-1 ring-foreground/5">
                <Link href={f.href} className="flex min-h-14 min-w-0 flex-1 items-center gap-3">
                  <Icon className="size-5 shrink-0 text-gold-ink" aria-hidden />
                  <span className="min-w-0">
                    <span className="block font-bold leading-tight">{f.title}</span>
                    {f.subtitle ? <span className="block truncate text-sm text-muted-foreground">{f.subtitle}</span> : null}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${f.title} dos favoritos`}
                  onClick={() => {
                    remove(f.key);
                    toast.success("Removido dos favoritos");
                  }}
                >
                  <Trash2 />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 text-center text-muted-foreground">Nenhum favorito nesta categoria.</p>
      )}
    </>
  );
}
