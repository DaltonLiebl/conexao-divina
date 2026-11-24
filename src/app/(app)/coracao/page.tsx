import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/shell/top-bar";
import { sentimentos } from "@/content/sentimentos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Como está seu coração?" };

export default function CoracaoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title="Como está seu coração?" backHref="/inicio" />
      <h1 className="text-[2.2rem] leading-tight font-semibold">Como está seu coração hoje?</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Escolha o que mais se parece com o que você sente. Vamos caminhar juntos com uma palavra de Deus para este
        momento.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sentimentos.map((s) => (
          <Link
            key={s.slug}
            href={`/coracao/${s.slug}`}
            className={cn(
              "flex min-h-28 flex-col items-start justify-between rounded-3xl p-4 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lift",
              s.tone === "joy" ? "bg-gold/12" : s.tone === "calm" ? "bg-sage/12" : "bg-card",
            )}
          >
            <span aria-hidden className="text-3xl">
              {s.emoji}
            </span>
            <span className="text-lg font-bold leading-tight">{s.label}</span>
          </Link>
        ))}
      </div>
      <p className="mt-8 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        As mensagens deste app são um apoio espiritual e não substituem acompanhamento médico ou psicológico. Se você
        estiver em sofrimento intenso, procure ajuda profissional ou ligue para o CVV no número 188 (gratuito, 24
        horas).
      </p>
    </div>
  );
}
