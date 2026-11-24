import type { Metadata } from "next";
import { jornadas } from "@/content/jornadas";
import { JourneyCard } from "@/components/journeys/journey-ui";

export const metadata: Metadata = { title: "Jornadas espirituais" };

export default function JornadasPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 pt-8 md:px-8 md:pb-16">
      <p className="eyebrow">Planos guiados</p>
      <h1 className="mt-1 text-[2.4rem] leading-tight font-semibold">Jornadas espirituais</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Alguns minutos por dia, um passo de cada vez. Seu progresso fica salvo neste aparelho.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {jornadas.map((j) => (
          <JourneyCard
            key={j.slug}
            slug={j.slug}
            title={j.title}
            subtitle={j.subtitle}
            scene={j.scene}
            total={j.days.length}
            minutes={j.minutesPerDay}
          />
        ))}
      </div>
    </div>
  );
}
