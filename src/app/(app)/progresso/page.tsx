import type { Metadata } from "next";
import { PageHeader } from "@/components/ds/layout";
import { ProgressOverview } from "@/components/progress/progress-ui";

export const metadata: Metadata = { title: "Meu progresso" };

export default function ProgressoPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Minha espiritualidade"
        title="Meu progresso espiritual"
        lead="Cada dia em que você lê a Palavra, ora ou avança numa jornada conta aqui. Os números ficam salvos neste aparelho."
      />
      <ProgressOverview />
    </div>
  );
}
