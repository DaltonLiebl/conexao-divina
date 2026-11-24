import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Scene } from "@/components/brand/scene";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

/**
 * Página pública provisória (Etapa 1). Na Etapa 2 vira a página de entrada,
 * com cadastro, login e apresentação do produto.
 */
export default function Home() {
  return (
    <main id="conteudo" className="relative isolate flex min-h-dvh flex-col">
      <div className="absolute inset-0 -z-10">
        <Scene variant="amanhecer" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />
      </div>
      <div className="mt-auto px-6 pb-14 pt-40 md:mx-auto md:max-w-xl md:text-center">
        <Logo className="md:justify-center" />
        <h1 className="mt-6 text-5xl leading-[1.05] font-semibold md:text-6xl">{brand.slogan}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{brand.description}</p>
        <div className="mt-8 rounded-3xl bg-card/80 p-5 text-left shadow-soft backdrop-blur">
          <p className="eyebrow">Em desenvolvimento</p>
          <p className="mt-1">
            A fundação do aplicativo está pronta. Cadastro, login e as telas do app chegam nas próximas etapas.
          </p>
          <Button className="mt-4" variant="soft" render={<Link href="/design-system" />} nativeButton={false}>
            Ver o design system
          </Button>
        </div>
      </div>
    </main>
  );
}
