"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_SCHEMA, SUPABASE_URL, authEnabled } from "./config";

let client: SupabaseClient | null = null;

/** Cliente do navegador (null quando o login ainda não foi configurado). */
export function getSupabase(): SupabaseClient | null {
  if (!authEnabled) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: SUPABASE_SCHEMA } }) as unknown as SupabaseClient;
  return client;
}
