"use client";

import { useTheme } from "next-themes";
import { Minus, Monitor, Moon, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fontScales } from "@/lib/appearance";
import { useAppearance, useIsClient } from "./appearance-provider";

/** Aumentar/diminuir a letra, com rótulo do tamanho atual. */
export function FontSizeControl({ className }: { className?: string }) {
  const { fontScale, setFontScale } = useAppearance();
  const idx = Math.max(
    0,
    fontScales.findIndex((s) => Math.abs(s.value - fontScale) < 0.01),
  );
  const current = fontScales.find((s) => Math.abs(s.value - fontScale) < 0.01);
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        variant="outline"
        size="icon"
        aria-label="Diminuir letra"
        disabled={idx <= 0}
        onClick={() => setFontScale(fontScales[Math.max(0, idx - 1)].value)}
      >
        <Minus />
      </Button>
      <div className="min-w-28 text-center" aria-live="polite">
        <span className="font-heading text-2xl font-semibold" aria-hidden>
          Aa
        </span>
        <span className="block text-sm text-muted-foreground">{current?.label ?? "Personalizada"}</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label="Aumentar letra"
        disabled={idx >= fontScales.length - 1}
        onClick={() => setFontScale(fontScales[Math.min(fontScales.length - 1, idx + 1)].value)}
      >
        <Plus />
      </Button>
    </div>
  );
}

const themeOptions = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
] as const;

/** Tema claro / escuro / automático, com botões grandes. */
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();
  return (
    <div role="radiogroup" aria-label="Tema" className={cn("grid grid-cols-3 gap-2", className)}>
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-2 text-sm font-semibold transition-colors",
              active
                ? "border-gold bg-gold/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-gold/60",
            )}
          >
            <Icon className="size-6" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Ícone de alternância rápida (cabeçalho). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsClient();
  const dark = mounted && resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}

export function ReduceMotionSwitch() {
  const { reduceMotion, setReduceMotion } = useAppearance();
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor="reduce-motion" className="flex-col items-start gap-0.5 text-base leading-snug">
        Reduzir animações
        <span className="block text-sm font-normal text-muted-foreground">Telas mais estáticas e tranquilas</span>
      </Label>
      <Switch id="reduce-motion" checked={reduceMotion} onCheckedChange={(v) => setReduceMotion(Boolean(v))} />
    </div>
  );
}
