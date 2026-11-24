import type { Ref } from "@/lib/bible/books";
import type { SceneVariant } from "@/components/brand/scene";

/*
 * Conteúdo inicial do app (textos autorais do projeto). O texto bíblico NUNCA é
 * escrito aqui: cada item aponta para uma referência e o versículo é lido da
 * Bíblia Livre em tempo de execução. O administrador poderá substituir este
 * conteúdo pelo painel (etapa do painel administrativo).
 */

export type DailyWord = {
  id: string;
  title: string;
  ref: Ref;
  scene: SceneVariant;
  reflection: string[]; // parágrafos
  application: string;
  prayer: string;
  minutes: number;
};

export type DailyVerse = {
  id: string;
  ref: Ref;
  context: string;
  reflection: string;
  application: string;
};

export type PrayerCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string; // nome do ícone Lucide
  scene: SceneVariant;
};

export type Prayer = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  ref?: Ref;
  body: string[];
  moment?: "manha" | "noite";
  minutes: number;
};

export type Feeling = {
  slug: string;
  label: string;
  emoji: string;
  tone: "joy" | "calm" | "heavy";
  welcome: string;
  ref: Ref;
  reflection: string[];
  prayer: string;
  reading: Ref; // capítulo sugerido para leitura
  readingWhy: string;
};

export type JourneyDay = {
  title: string;
  ref: Ref;
  reflection: string[];
  practice: string;
  prayer: string;
};

export type Journey = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  scene: SceneVariant;
  minutesPerDay: number;
  days: JourneyDay[];
};

export type HopeMessage = { text: string; ref: Ref };
