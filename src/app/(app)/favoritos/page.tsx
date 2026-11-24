import type { Metadata } from "next";
import { FavoritesList } from "@/components/content/favorites-list";
import { PageHeader } from "@/components/ds/layout";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritosPage() {
  return (
    <div className="page">
      <PageHeader
        className="mb-4 lg:mb-6"
        eyebrow="Minha espiritualidade"
        title="Meus favoritos"
        lead="Palavras, versículos e orações que tocaram o seu coração."
      />
      <FavoritesList />
    </div>
  );
}
