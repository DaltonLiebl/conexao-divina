import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { brand } from "@/lib/brand";

/** Telas de conta: foto com versículo à esquerda (computador) e formulário à direita. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative isolate hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- foto local otimizada */}
        <img src="/images/hero-cruz.webp" alt="" aria-hidden className="absolute inset-0 -z-10 size-full object-cover object-[60%_center]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#0b1220] via-[#0b1220]/40 to-[#0b1220]/30" />
        <div className="flex h-full flex-col justify-between p-12 text-[#f5f1e8]">
          <Link href="/inicio" aria-label={`${brand.name}, ir para o início`} className="w-fit [&_span]:!text-[#f5f1e8]">
            <Logo showSlogan />
          </Link>
          <figure className="max-w-lg">
            <blockquote className="font-heading text-[2rem] leading-snug font-medium italic">
              “Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.”
            </blockquote>
            <figcaption className="mt-4 font-semibold text-[#d4b47c]">Mateus 11:28</figcaption>
          </figure>
        </div>
      </aside>

      <main id="conteudo" className="flex flex-col">
        <div className="relative isolate h-44 overflow-hidden lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- foto local otimizada */}
          <img src="/images/hero-cruz.webp" alt="" aria-hidden className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/30 to-[#0b1220]/30" />
          <Link href="/inicio" className="absolute left-5 top-5 pt-safe [&_span]:!text-[#f5f1e8]" aria-label={`${brand.name}, ir para o início`}>
            <Logo compact />
          </Link>
        </div>
        <div className="flex flex-1 items-start justify-center px-5 pb-12 pt-2 lg:items-center lg:px-10 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
