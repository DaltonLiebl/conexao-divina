import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, authEnabled } from "@/lib/supabase/config";

/** Renova a sessão do Supabase a cada navegação (cookies). O app funciona sem login. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!authEnabled) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|icons/|favicon|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml|sw.js).*)"],
};
