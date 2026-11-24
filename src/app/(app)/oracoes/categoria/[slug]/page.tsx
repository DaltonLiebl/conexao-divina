import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { Scene } from "@/components/brand/scene";
import { categoriaPorSlug, categoriasOracao, oracoes } from "@/content/oracoes";

export function generateStaticParams() {
  return categoriasOracao.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/oracoes/categoria/[slug]">): Promise<Metadata> {
  return { title: categoriaPorSlug((await params).slug)?.name ?? "Orações" };
}

export default async function CategoriaPage({ params }: PageProps<"/oracoes/categoria/[slug]">) {
  const c = categoriaPorSlug((await params).slug);
  if (!c) notFound();
  const list = oracoes.filter((o) => o.category === c.slug);
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title={c.name} backHref="/oracoes" />
      <div className="relative h-40 overflow-hidden rounded-4xl">
        <Scene variant={c.scene} />
        <div className="absolute inset-0 bg-linear-to-t from-[#0d1724]/70 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="text-[2rem] font-semibold">{c.name}</h1>
          <p className="text-white/85">{c.description}</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {list.map((o) => (
          <li key={o.slug}>
            <Link
              href={`/oracoes/${o.slug}`}
              className="flex items-center gap-3 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all hover:shadow-lift"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[1.45rem] leading-tight font-semibold">{o.title}</span>
                <span className="block text-muted-foreground">{o.summary}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-3.5" /> {o.minutes} min
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
