import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { Scene } from "@/components/brand/scene";
import { VerseText } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { DemoNote } from "@/components/content/daily-views";
import { getPassage } from "@/lib/bible/server";
import { chapterHref } from "@/lib/bible/books";
import { categoriaPorSlug, oracaoPorSlug, oracoes } from "@/content/oracoes";

export function generateStaticParams() {
  return oracoes.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/oracoes/[slug]">): Promise<Metadata> {
  return { title: oracaoPorSlug((await params).slug)?.title ?? "Oração" };
}

export default async function OracaoPage({ params }: PageProps<"/oracoes/[slug]">) {
  const o = oracaoPorSlug((await params).slug);
  if (!o) notFound();
  const cat = categoriaPorSlug(o.category)!;
  const verse = o.ref ? await getPassage(o.ref) : null;
  const others = oracoes.filter((x) => x.category === o.category && x.slug !== o.slug);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title={cat.name} backHref={`/oracoes/categoria/${cat.slug}`} />
      <div className="relative h-48 overflow-hidden rounded-4xl">
        <Scene variant={cat.scene} />
      </div>
      <p className="eyebrow mt-6">{cat.name}</p>
      <h1 className="mt-1 text-[2.3rem] leading-tight font-semibold">{o.title}</h1>

      <ActionBar
        className="mt-5"
        shareTitle={o.title}
        shareText={`${o.title}\n\n${o.body.join("\n\n")}`}
        listenText={`${o.title}. ${o.body.join(" ")}`}
        favorite={{ key: `oracao:${o.slug}`, kind: "oracao", title: o.title, subtitle: cat.name, href: `/oracoes/${o.slug}` }}
      />

      <div className="prose-reading mt-8 text-[1.15rem]">
        {o.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {verse && o.ref ? (
        <blockquote className="mt-8 rounded-3xl bg-muted/70 p-5">
          <p className="font-reading italic leading-relaxed">
            “<VerseText text={verse.text} />”
          </p>
          <Link
            href={chapterHref(o.ref)}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gold-ink hover:underline"
          >
            {verse.label} <ChevronRight className="size-4" />
          </Link>
        </blockquote>
      ) : null}

      {others.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Outras orações deste tema</h2>
          <ul className="mt-3 space-y-2">
            {others.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/oracoes/${x.slug}`}
                  className="flex min-h-14 items-center justify-between rounded-2xl bg-card px-5 font-semibold shadow-soft"
                >
                  {x.title} <ChevronRight className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <DemoNote />
    </div>
  );
}
