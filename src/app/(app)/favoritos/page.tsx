import type { Metadata } from "next";
import { TopBar } from "@/components/shell/top-bar";
import { FavoritesList } from "@/components/content/favorites-list";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title="Favoritos" backHref="/inicio" />
      <h1 className="text-[2.2rem] font-semibold">Seus favoritos</h1>
      <p className="mt-1 text-muted-foreground">Palavras, versículos e orações que tocaram o seu coração.</p>
      <FavoritesList />
    </div>
  );
}
