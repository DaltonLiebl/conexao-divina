import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ds/layout";
import { sentimentos } from "@/content/sentimentos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Como está seu coração?" };

export default function CoracaoPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Para você"
        title="Como está seu coração hoje?"
        lead="Escolha o que mais se parece com o que você sente. Vamos caminhar juntos com uma palavra de Deus para este momento."
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {sentimentos.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/coracao/${s.slug}`}
              className={cn(
                "surface surface-link flex min-h-36 flex-col items-start justify-between p-5",
                s.tone === "joy" && "bg-linear-to-br from-gold/14 to-card",
                s.tone === "calm" && "bg-linear-to-br from-sage/14 to-card",
              )}
            >
              <span aria-hidden className="text-4xl">
                {s.emoji}
              </span>
              <span className="font-heading text-xl leading-tight font-semibold">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 max-w-3xl rounded-2xl border border-border/70 bg-background-2/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        As mensagens deste app são um apoio espiritual e não substituem acompanhamento médico ou psicológico. Se você
        estiver em sofrimento intenso, procure ajuda profissional ou ligue para o CVV no número 188 (gratuito, 24
        horas).
      </p>
    </div>
  );
}
