"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Barra superior das telas internas: voltar + título. */
export function TopBar({ title, backHref, action }: { title: string; backHref?: string; action?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 -mx-5 mb-4 flex items-center gap-2 border-b border-border/60 bg-background/85 px-3 py-2 backdrop-blur-md pt-safe md:-mx-8 md:px-6">
      {backHref ? (
        <Button variant="ghost" size="icon" aria-label="Voltar" render={<Link href={backHref} />} nativeButton={false}>
          <ChevronLeft className="size-6" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/inicio"))}
        >
          <ChevronLeft className="size-6" />
        </Button>
      )}
      <p className="min-w-0 flex-1 truncate text-lg font-bold">{title}</p>
      {action}
    </header>
  );
}
