import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_SCHEMA, SUPABASE_URL, authEnabled } from "./config";

/** Cliente do servidor com a sessão dos cookies (null sem configuração). */
export async function getServerSupabase() {
  if (!authEnabled) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: SUPABASE_SCHEMA },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* chamado de um Server Component: o proxy renova a sessão */
        }
      },
    },
  });
}
