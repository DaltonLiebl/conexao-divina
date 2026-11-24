"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Barra "voltar" das telas internas.
 * Celular: fixa no topo, com o título. Tablet/computador: link discreto "Voltar"
 * (o cabeçalho geral já fica fixo no topo).
 */
export function TopBar({ title, backHref, action }: { title: string; backHref?: string; action?: React.ReactNode }) {
  const router = useRouter();
  const label = (
    <>
      <ChevronLeft className="size-6 md:size-5" />
      <span className="sr-only md:not-sr-only">Voltar</span>
    </>
  );
  const cls = "md:h-10 md:w-auto md:gap-1 md:px-3 md:pl-2 md:text-[0.95rem] md:font-medium md:text-muted-foreground md:hover:text-foreground";
  return (
    <header className="sticky top-0 z-30 -mx-5 mb-5 flex items-center gap-2 border-b border-border/70 bg-background/85 px-3 py-2 backdrop-blur-xl pt-safe md:static md:mx-0 md:mb-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      {backHref ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          className={cls}
          render={<Link href={backHref} />}
          nativeButton={false}
        >
          {label}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          className={cls}
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/inicio"))}
        >
          {label}
        </Button>
      )}
      <p className="min-w-0 flex-1 truncate text-lg font-semibold md:sr-only">{title}</p>
      <span className="md:ml-auto">{action}</span>
    </header>
  );
}
