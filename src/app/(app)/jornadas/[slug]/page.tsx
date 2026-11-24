import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/shell/top-bar";
import { Scene } from "@/components/brand/scene";
import { JourneyDays } from "@/components/journeys/journey-ui";
import { formatRef } from "@/lib/bible/books";
import { jornadaPorSlug, jornadas } from "@/content/jornadas";

export function generateStaticParams() {
  return jornadas.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/jornadas/[slug]">): Promise<Metadata> {
  return { title: jornadaPorSlug((await params).slug)?.title ?? "Jornada" };
}

export default async function JornadaPage({ params }: PageProps<"/jornadas/[slug]">) {
  const j = jornadaPorSlug((await params).slug);
  if (!j) notFound();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title={j.title} backHref="/jornadas" />
      <div className="relative h-48 overflow-hidden rounded-4xl">
        <Scene variant={j.scene} />
      </div>
      <p className="eyebrow mt-6">
        {j.days.length} dias · {j.minutesPerDay} min por dia
      </p>
      <h1 className="mt-1 text-[2.4rem] leading-tight font-semibold">{j.title}</h1>
      <p className="prose-reading mt-2">{j.description}</p>
      <JourneyDays slug={j.slug} days={j.days.map((d) => ({ title: d.title, label: formatRef(d.ref) }))} />
    </div>
  );
}
