import { palavras } from "@/content/palavras";
import { versiculos } from "@/content/versiculos";
import { esperanca } from "@/content/esperanca";

export const TZ = "America/Sao_Paulo";

/** Data de hoje no Brasil, no formato AAAA-MM-DD. */
export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00Z`));
}

/** Soma dias a uma data AAAA-MM-DD. */
export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "segunda-feira, 24 de novembro" */
export function formatLongDate(iso: string, withYear = false) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "numeric", month: "short" })
    .format(new Date(`${iso}T12:00:00Z`))
    .replace(".", "");
}

/** Número do dia desde 01/01/2024 (base do rodízio: todos veem o mesmo conteúdo no mesmo dia). */
function dayNumber(iso: string) {
  return Math.floor((Date.parse(`${iso}T12:00:00Z`) - Date.parse("2024-01-01T12:00:00Z")) / 86_400_000);
}

function pick<T>(list: T[], iso: string, offset = 0) {
  const n = list.length;
  return list[(((dayNumber(iso) + offset) % n) + n) % n];
}

export const palavraDoDia = (iso: string) => pick(palavras, iso);
export const versiculoDoDia = (iso: string) => pick(versiculos, iso, 5);
export const esperancaDoDia = (iso: string) => pick(esperanca, iso, 3);

/** Quantos dias anteriores podem ser consultados. */
export const HISTORY_DAYS = 30;

export function canShowDate(iso: string, today: string) {
  return isISODate(iso) && iso <= today && iso >= addDays(today, -HISTORY_DAYS);
}
