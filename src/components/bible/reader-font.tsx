"use client";

import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FontSizeControl, ThemeToggle } from "@/components/appearance/appearance-controls";

/** Ajuste rápido de letra e de modo noturno dentro do leitor. */
export function ReaderFontButton() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="Tamanho da letra e modo noturno" />}>
        <Type className="size-6" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto rounded-3xl p-5">
        <p className="mb-3 font-semibold">Tamanho da letra</p>
        <FontSizeControl />
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
          <span className="font-semibold">Modo noturno</span>
          <ThemeToggle />
        </div>
      </PopoverContent>
    </Popover>
  );
}
