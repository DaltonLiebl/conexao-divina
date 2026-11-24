"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useLastReading } from "@/lib/local-store";
import { cn } from "@/lib/utils";

/** Cartão "Continuar de onde parou" (some se ainda não houver leitura). */
export function ContinueReading({ className }: { className?: string }) {
  const [last] = useLastReading();
  if (!last) return null;
  return (
    <Link
      href={`/biblia/${last.book}/${last.chapter}`}
      className={cn("verse-card group flex items-center gap-5 p-5 md:p-6", className)}
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#d4b47c]/15 text-[#d4b47c] ring-1 ring-[#d4b47c]/25">
        <BookOpen className="size-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-[#f5f1e8]/70">Continuar de onde parou</span>
        <span className="block font-heading text-2xl font-semibold">{last.label}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-[#d4b47c] transition-transform group-hover:translate-x-1" />
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
