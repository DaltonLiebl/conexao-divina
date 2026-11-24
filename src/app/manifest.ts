import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/inicio?origem=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: brand.colors.night,
    theme_color: brand.colors.navy,
    categories: ["lifestyle", "books", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Palavra do dia", url: "/palavra", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Bíblia", url: "/biblia", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Orações", url: "/oracoes", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
