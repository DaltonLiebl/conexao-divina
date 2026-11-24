/**
 * Preferências de aparência que precisam valer ANTES da primeira pintura
 * (evita o "pulo" de tamanho de letra). Ficam no localStorage do aparelho e,
 * para usuários logados, também em conexao.preferences (sincronizadas depois).
 */
export const FONT_SCALE_KEY = "cd:font-scale";
export const REDUCE_MOTION_KEY = "cd:reduce-motion";

export const fontScales = [
  { value: 0.9, label: "Pequena" },
  { value: 1, label: "Normal" },
  { value: 1.15, label: "Grande" },
  { value: 1.3, label: "Muito grande" },
  { value: 1.5, label: "Máxima" },
] as const;

export function clampFontScale(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.min(1.6, Math.max(0.85, v));
}

export function applyFontScale(v: number) {
  document.documentElement.style.setProperty("--font-scale", String(clampFontScale(v)));
}

export function applyReduceMotion(on: boolean) {
  document.documentElement.dataset.reduceMotion = on ? "true" : "false";
}

/** Script inline executado no <head>, antes do React. */
export const appearanceBootScript = `(function(){try{var s=parseFloat(localStorage.getItem(${JSON.stringify(
  FONT_SCALE_KEY,
)}));if(s>=0.85&&s<=1.6)document.documentElement.style.setProperty('--font-scale',String(s));if(localStorage.getItem(${JSON.stringify(
  REDUCE_MOTION_KEY,
)})==='true')document.documentElement.dataset.reduceMotion='true';}catch(e){}})();`;
