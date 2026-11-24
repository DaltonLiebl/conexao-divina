"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
  FONT_SCALE_KEY,
  REDUCE_MOTION_KEY,
  applyFontScale,
  applyReduceMotion,
  clampFontScale,
} from "@/lib/appearance";

/*
 * As preferências vivem no localStorage (lidas antes da pintura pelo script de
 * boot). Este store expõe esses valores ao React e avisa as outras abas.
 */
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === FONT_SCALE_KEY && e.newValue) applyFontScale(parseFloat(e.newValue));
    if (e.key === REDUCE_MOTION_KEY) applyReduceMotion(e.newValue === "true");
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
function notify() {
  listeners.forEach((l) => l());
}
function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // modo privado / armazenamento bloqueado
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

const getFontScale = () => {
  const s = parseFloat(read(FONT_SCALE_KEY) ?? "");
  return Number.isFinite(s) ? clampFontScale(s) : 1;
};
const getReduceMotion = () => read(REDUCE_MOTION_KEY) === "true";

type Appearance = {
  fontScale: number;
  setFontScale: (v: number) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
};

const AppearanceContext = createContext<Appearance | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const fontScale = useSyncExternalStore(subscribe, getFontScale, () => 1);
  const reduceMotion = useSyncExternalStore(subscribe, getReduceMotion, () => false);

  const setFontScale = useCallback((v: number) => {
    const next = clampFontScale(v);
    applyFontScale(next);
    write(FONT_SCALE_KEY, String(next));
    notify();
  }, []);

  const setReduceMotion = useCallback((v: boolean) => {
    applyReduceMotion(v);
    write(REDUCE_MOTION_KEY, String(v));
    notify();
  }, []);

  const value = useMemo(
    () => ({ fontScale, setFontScale, reduceMotion, setReduceMotion }),
    [fontScale, setFontScale, reduceMotion, setReduceMotion],
  );
  return <AppearanceContext value={value}>{children}</AppearanceContext>;
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance precisa estar dentro de <AppearanceProvider>");
  return ctx;
}

/** true somente no navegador, após a hidratação (sem efeito + setState). */
const noopSubscribe = () => () => {};
export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
