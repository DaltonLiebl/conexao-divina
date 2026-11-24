"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { useLastReading } from "@/lib/local-store";
import { cn } from "@/lib/utils";

/** Cartão "Continuar de onde parou" (some se ainda não houver leitura). */
export function ContinueReading({ className }: { className?: string }) {
  const [last] = useLastReading();
  if (!last) return null;
  return (
    <Link
      href={`/biblia/${last.book}/${last.chapter}`}
      className={cn(
        "flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5",
        className,
      )}
    >
      <BookOpen className="size-7 shrink-0 text-gold" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold opacity-80">Continuar de onde parou</span>
        <span className="block text-xl font-bold">{last.label}</span>
      </span>
      <ChevronRight className="size-5 shrink-0" />
    </Link>
  );
}

/** Registra o capítulo aberto como "última leitura". */
export function TrackReading({ book, chapter, label }: { book: string; chapter: number; label: string }) {
  const [, setLast] = useLastReading();
  useEffect(() => {
    setLast({ book, chapter, label, at: new Date().toISOString() });
  }, [book, chapter, label, setLast]);
  return null;
}
