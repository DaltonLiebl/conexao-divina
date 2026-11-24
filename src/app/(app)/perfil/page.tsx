import type { Metadata } from "next";
import { Heart, Info } from "lucide-react";
import { FontSizeControl, ReduceMotionSwitch, ThemeSelector } from "@/components/appearance/appearance-controls";
import { NameEditor, ResetDeviceData } from "@/components/profile/profile-client";
import { InstallApp } from "@/components/profile/install-app";
import { BIBLE_TRANSLATION } from "@/lib/bible/books";
import { Logo } from "@/components/brand/logo";
import { ListLink, PageHeader } from "@/components/ds/layout";
import { AccountCard } from "@/components/auth/account-card";

export const metadata: Metadata = { title: "Perfil" };

export default function PerfilPage() {
  return (
    <div className="page">
      <PageHeader eyebrow="Conta" title="Perfil e ajustes" lead="Deixe o aplicativo do seu jeito." />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 xl:gap-6">
        <div className="space-y-5 xl:space-y-6">
          <Card title="Sua conta">
            <AccountCard />
          </Card>
          <Card title="Seu nome">
            <NameEditor />
          </Card>
          <Card title="Tamanho da letra">
            <FontSizeControl />
          </Card>
          <Card title="Aparência">
            <ThemeSelector />
            <div className="mt-5">
              <ReduceMotionSwitch />
            </div>
          </Card>
        </div>

        <div className="space-y-5 xl:space-y-6">
          <Card title="Atalhos">
            <ListLink href="/favoritos" icon={Heart} title="Meus favoritos" hint="Palavras, versículos e orações salvos" />
          </Card>
          <Card title="Instalar o aplicativo">
            <InstallApp />
          </Card>
          <Card title="Seus dados">
            <p className="text-muted-foreground">
              Seu nome, favoritos, destaques e progresso ficam salvos neste aparelho. Em breve, quem tiver conta
              poderá sincronizá-los e acessar de qualquer lugar.
            </p>
            <ResetDeviceData />
          </Card>
          <Card title="Sobre">
            <Logo showSlogan />
            <p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{BIBLE_TRANSLATION.credit}</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              O conteúdo deste app é um apoio espiritual e não substitui acompanhamento médico ou psicológico.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface p-6">
      <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
