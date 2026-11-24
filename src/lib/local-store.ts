"use client";

import { useCallback, useSyncExternalStore } from "react";

/*
 * Dados do usuário guardados NESTE aparelho (localStorage), enquanto o login
 * ainda não existe. Na etapa de autenticação eles passam a ser sincronizados
 * com o banco (tabelas favorites, journey_day_completions, etc.).
 */

const PREFIX = "cd:";
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(PREFIX)) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PREFIX + key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* armazenamento cheio ou bloqueado */
  }
  listeners.forEach((l) => l());
}

/** Estado persistente no aparelho. O fallback precisa ser estável (constante fora do componente). */
export function useLocalState<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      write(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, fallback],
  );
  return [value, set] as const;
}

// ---------------------------------------------------------------------------
// Favoritos

export type FavoriteKind = "palavra" | "versiculo" | "oracao" | "biblia" | "sentimento";
export type Favorite = {
  key: string; // kind:id
  kind: FavoriteKind;
  title: string;
  subtitle?: string;
  href: string;
  savedAt: string;
};

const NO_FAVORITES: Favorite[] = [];

export function useFavorites() {
  const [list, setList] = useLocalState<Favorite[]>("favoritos", NO_FAVORITES);
  const isFavorite = useCallback((key: string) => list.some((f) => f.key === key), [list]);
  const toggle = useCallback(
    (fav: Omit<Favorite, "savedAt">) => {
      let added = false;
      setList((prev) => {
        if (prev.some((f) => f.key === fav.key)) return prev.filter((f) => f.key !== fav.key);
        added = true;
        return [{ ...fav, savedAt: new Date().toISOString() }, ...prev];
      });
      return added;
    },
    [setList],
  );
  const remove = useCallback((key: string) => setList((prev) => prev.filter((f) => f.key !== key)), [setList]);
  return { list, isFavorite, toggle, remove };
}

// ---------------------------------------------------------------------------
// Perfil local

export type LocalProfile = { name: string; askedName: boolean };
const NO_PROFILE: LocalProfile = { name: "", askedName: false };
export const useLocalProfile = () => useLocalState<LocalProfile>("perfil", NO_PROFILE);

// ---------------------------------------------------------------------------
// Jornadas: dias concluídos por jornada

const NO_PROGRESS: Record<string, number[]> = {};
export const useJourneyProgress = () => useLocalState<Record<string, number[]>>("jornadas", NO_PROGRESS);

// ---------------------------------------------------------------------------
// Bíblia: último capítulo lido

export type LastReading = { book: string; chapter: number; label: string; at: string } | null;
export const useLastReading = () => useLocalState<LastReading>("ultima-leitura", null);
