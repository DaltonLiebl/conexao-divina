import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Scene } from "@/components/brand/scene";
import { categoriasOracao, oracoes } from "@/content/oracoes";

export const metadata: Metadata = { title: "Orações" };

export default function OracoesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 pt-8 md:px-8 md:pb-16">
      <p className="eyebrow">Central de orações</p>
      <h1 className="mt-1 text-[2.4rem] leading-tight font-semibold">Orações para cada momento</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Escolha um tema e ore com calma. Você também pode ouvir cada oração em voz alta.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {categoriasOracao.map((c) => {
          const count = oracoes.filter((o) => o.category === c.slug).length;
          return (
            <Link
              key={c.slug}
              href={`/oracoes/categoria/${c.slug}`}
              className="group flex items-center gap-4 overflow-hidden rounded-3xl bg-card p-3 pr-4 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="size-16 shrink-0 overflow-hidden rounded-2xl">
                <Scene variant={c.scene} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold leading-tight">{c.name}</span>
                <span className="block text-sm text-muted-foreground">
                  {c.description} · {count} {count === 1 ? "oração" : "orações"}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
