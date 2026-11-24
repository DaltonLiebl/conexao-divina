import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, CalendarDays } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { Scene } from "@/components/brand/scene";
import { JourneyDays } from "@/components/journeys/journey-ui";
import { formatRef } from "@/lib/bible/books";
import { journeyPhotos, jornadaPorSlug, jornadas } from "@/content/jornadas";

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
    <div className="page">
      <TopBar title={j.title} backHref="/jornadas" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <header className="relative isolate overflow-hidden rounded-4xl ring-1 ring-white/5">
            <div className="absolute inset-0 -z-10">
              <Scene variant={j.scene} src={journeyPhotos[j.slug]} />
              <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/45 to-transparent" />
            </div>
            <div className="flex min-h-[16rem] flex-col justify-end p-7 text-[#f5f1e8] md:min-h-[20rem] md:p-9">
              <p className="eyebrow text-[#e8d5ac]">Jornada espiritual</p>
              <h1 className="mt-2 font-heading text-[2.2rem] leading-[1.1] font-semibold md:text-[2.7rem]">{j.title}</h1>
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#f5f1e8]/75">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden /> {j.days.length} dias
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden /> {j.minutesPerDay} min por dia
                </span>
              </p>
            </div>
          </header>
          <p className="prose-reading mt-6 text-[1.1rem]">{j.description}</p>
        </div>
        <div>
          <JourneyDays slug={j.slug} days={j.days.map((d) => ({ title: d.title, label: formatRef(d.ref) }))} />
        </div>
      </div>
    </div>
  );
}
