import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacidade", "/termos", "/premium"],
        // áreas logadas e painel não devem ser indexados
        disallow: ["/admin", "/inicio", "/perfil", "/diario", "/pedidos", "/api", "/design-system"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
