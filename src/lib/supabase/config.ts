/**
 * Configuração do Supabase. Sem as variáveis, o app funciona sem login
 * (dados no aparelho) e as telas de conta avisam que o login não está ativo.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? "conexao";

export const authEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);
/** "Entrar com Google" só aparece depois que o OAuth for configurado no Supabase. */
export const googleEnabled = authEnabled && process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true";

/** Só aceita caminhos internos (evita redirecionamento para outro site). */
export function safeNext(next: string | null | undefined, fallback = "/inicio") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
