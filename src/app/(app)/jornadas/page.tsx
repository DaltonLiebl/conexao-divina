import type { Metadata } from "next";
import { jornadas } from "@/content/jornadas";
import { JourneyCard } from "@/components/journeys/journey-ui";
import { PageHeader } from "@/components/ds/layout";

export const metadata: Metadata = { title: "Jornadas espirituais" };

export default function JornadasPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Planos guiados"
        title="Jornadas espirituais"
        lead="Alguns minutos por dia, um passo de cada vez. Seu progresso fica salvo neste aparelho."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
