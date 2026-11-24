import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, HandHeart } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { Scene } from "@/components/brand/scene";
import { VerseText } from "@/components/bible/verse-text";
import { ActionBar } from "@/components/content/action-bar";
import { DemoNote } from "@/components/content/daily-views";
import { AsideCard, ListLink, ReadingLayout } from "@/components/ds/layout";
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
    <div className="page">
      <TopBar title={cat.name} backHref={`/oracoes/categoria/${cat.slug}`} />

      <header className="relative isolate overflow-hidden rounded-4xl ring-1 ring-white/5">
        <div className="absolute inset-0 -z-10">
          <Scene variant={cat.scene} />
          <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/50 to-[#0b1220]/5" />
        </div>
        <div className="flex min-h-[15rem] flex-col justify-end px-6 pb-7 pt-16 text-[#f5f1e8] md:min-h-[19rem] md:px-10 md:pb-9">
          <p className="eyebrow text-[#e8d5ac]">{cat.name}</p>
          <h1 className="mt-2 font-heading text-[2.2rem] leading-[1.1] font-semibold md:text-[2.9rem]">{o.title}</h1>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#f5f1e8]/75">
            <Clock className="size-4" aria-hidden /> {o.minutes} min
          </p>
        </div>
      </header>

      <ReadingLayout
        actions={
          <ActionBar className="grid grid-cols-2 gap-2 sm:flex"
                shareTitle={o.title}
                shareText={`${o.title}\n\n${o.body.join("\n\n")}`}
                listenText={`${o.title}. ${o.body.join(" ")}`}
                favorite={{ key: `oracao:${o.slug}`, kind: "oracao", title: o.title, subtitle: cat.name, href: `/oracoes/${o.slug}` }}
              />
        }
        className="mt-8 lg:mt-10"
        aside={
          <>
            {others.length ? (
              <AsideCard title="Outras orações deste tema">
                <div className="space-y-1">
                  {others.map((x) => (
                    <ListLink key={x.slug} href={`/oracoes/${x.slug}`} icon={HandHeart} title={x.title} hint={`${x.minutes} min`} />
                  ))}
                </div>
              </AsideCard>
            ) : null}
          </>
        }
      >
        <div className="prose-reading text-[1.18rem]">
          {o.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {verse && o.ref ? (
          <blockquote className="verse-card mt-10 p-7 md:p-8">
            <p className="font-heading text-[1.25rem] leading-relaxed italic">
              “<VerseText text={verse.text} />”
            </p>
            <Link
              href={chapterHref(o.ref)}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#d4b47c] hover:underline"
            >
              {verse.label} <ChevronRight className="size-4" />
            </Link>
          </blockquote>
        ) : null}

        <DemoNote />
      </ReadingLayout>
    </div>
  );
}
