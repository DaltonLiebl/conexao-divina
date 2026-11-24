import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Scene } from "@/components/brand/scene";
import { PageHeader } from "@/components/ds/layout";
import { categoriasOracao, oracoes } from "@/content/oracoes";

export const metadata: Metadata = { title: "Orações" };

export default function OracoesPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Central de orações"
        title="Orações para cada momento"
        lead="Escolha um tema e ore com calma. Você também pode ouvir cada oração em voz alta."
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {categoriasOracao.map((c) => {
          const count = oracoes.filter((o) => o.category === c.slug).length;
          return (
            <li key={c.slug}>
              <Link
                href={`/oracoes/categoria/${c.slug}`}
                className="surface surface-link group flex h-full flex-col overflow-hidden"
              >
                <span className="relative block h-28 overflow-hidden md:h-32">
                  <Scene variant={c.scene} />
                  <span className="absolute inset-0 bg-linear-to-t from-card via-card/10 to-transparent" />
                </span>
                <span className="-mt-4 flex flex-1 flex-col px-5 pb-5">
                  <span className="relative font-heading text-[1.35rem] leading-tight font-semibold">{c.name}</span>
                  <span className="mt-1 block text-[0.95rem] text-muted-foreground">{c.description}</span>
                  <span className="mt-auto flex items-center justify-between pt-4 text-sm">
                    <span className="text-muted-foreground">
                      {count} {count === 1 ? "oração" : "orações"}
                    </span>
                    <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
