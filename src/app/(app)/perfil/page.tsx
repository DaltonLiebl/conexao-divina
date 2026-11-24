import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Heart, Info } from "lucide-react";
import { FontSizeControl, ReduceMotionSwitch, ThemeSelector } from "@/components/appearance/appearance-controls";
import { NameEditor, ResetDeviceData } from "@/components/profile/profile-client";
import { InstallApp } from "@/components/profile/install-app";
import { BIBLE_TRANSLATION } from "@/lib/bible/books";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Perfil" };

export default function PerfilPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 pt-8 md:px-8 md:pb-16">
      <h1 className="text-[2.4rem] font-semibold">Perfil</h1>

      <div className="mt-6 space-y-5">
        <Card title="Seu nome">
          <NameEditor />
        </Card>

        <Link
          href="/favoritos"
          className="flex min-h-16 items-center gap-4 rounded-3xl bg-card px-5 shadow-soft ring-1 ring-foreground/5"
        >
          <Heart className="size-6 text-gold-ink" />
          <span className="flex-1 text-lg font-bold">Meus favoritos</span>
          <ChevronRight className="size-5" />
        </Link>

        <Card title="Tamanho da letra">
          <FontSizeControl />
        </Card>

        <Card title="Aparência">
          <ThemeSelector />
          <div className="mt-5">
            <ReduceMotionSwitch />
          </div>
        </Card>

        <Card title="Instalar o aplicativo">
          <InstallApp />
        </Card>

        <Card title="Seus dados">
          <p className="text-muted-foreground">
            Por enquanto, seu nome, favoritos, destaques e o progresso das jornadas ficam salvos somente neste aparelho.
            Quando o login for ativado, você poderá guardá-los na sua conta e acessar de qualquer lugar.
          </p>
          <ResetDeviceData />
        </Card>

        <Card title="Sobre">
          <Logo showSlogan />
          <p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>{BIBLE_TRANSLATION.credit}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            O conteúdo deste app é um apoio espiritual e não substitui acompanhamento médico ou psicológico.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
      <h2 className="mb-4 font-sans text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
