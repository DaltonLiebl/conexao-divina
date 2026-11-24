import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
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
    <div className="page">
      <TopBar title={c.name} backHref="/oracoes" />
      <header className="relative isolate overflow-hidden rounded-4xl ring-1 ring-white/5">
        <div className="absolute inset-0 -z-10">
          <Scene variant={c.scene} />
          <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/45 to-transparent" />
        </div>
        <div className="flex min-h-[13rem] flex-col justify-end p-7 text-[#f5f1e8] md:min-h-[16rem] md:p-9">
          <p className="eyebrow text-[#e8d5ac]">Orações</p>
          <h1 className="mt-2 font-heading text-[2.2rem] leading-tight font-semibold md:text-[2.7rem]">{c.name}</h1>
          <p className="mt-1 text-[#f5f1e8]/80">{c.description}</p>
        </div>
      </header>
      <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((o) => (
          <li key={o.slug}>
            <Link href={`/oracoes/${o.slug}`} className="surface surface-link group flex h-full flex-col p-6">
              <span className="font-heading text-[1.45rem] leading-tight font-semibold">{o.title}</span>
              <span className="mt-2 block flex-1 text-muted-foreground">{o.summary}</span>
              <span className="mt-5 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-4" aria-hidden /> {o.minutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-gold">
                  Orar <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
