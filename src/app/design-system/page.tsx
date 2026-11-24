import type { Metadata } from "next";
import {
  BookOpen,
  HandHeart,
  Heart,
  Leaf,
  Map,
  NotebookPen,
  Share2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Scene, sceneLabels, sceneVariants } from "@/components/brand/scene";
import {
  FontSizeControl,
  ReduceMotionSwitch,
  ThemeSelector,
  ThemeToggle,
} from "@/components/appearance/appearance-controls";
import { DemoBadge, PremiumBadge } from "@/components/ds/badges";
import { HeroCard, PageContainer, SectionHeader, ShortcutTile } from "@/components/ds/layout";
import { FadeIn } from "@/components/ds/motion";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ds/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { DemoInteractions } from "./demo-interactions";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "Bege claro", token: "bg-sand", hex: "#F8F5EF", ring: true },
  { name: "Dourado suave", token: "bg-[#C5A46D]", hex: "#C5A46D" },
  { name: "Azul profundo", token: "bg-[#17283E]", hex: "#17283E" },
  { name: "Branco", token: "bg-white", hex: "#FFFFFF", ring: true },
  { name: "Verde suave", token: "bg-[#819B89]", hex: "#819B89" },
  { name: "Texto", token: "bg-[#252525]", hex: "#252525" },
];

const highlights = [
  { cls: "bg-hl-gold", name: "Dourado" },
  { cls: "bg-hl-green", name: "Verde" },
  { cls: "bg-hl-blue", name: "Azul" },
  { cls: "bg-hl-rose", name: "Rosa" },
  { cls: "bg-hl-lilac", name: "Lilás" },
];

export default function DesignSystemPage() {
  return (
    <main id="conteudo">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md pt-safe">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 md:px-8">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <PageContainer className="space-y-14">
        <FadeIn>
          <p className="eyebrow">Etapa 1 · Fundamentos</p>
          <h1 className="mt-2 text-5xl font-semibold">Design system</h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Cores, tipografia, componentes e estados usados em todo o Conexão Divina. Troque o tema e o tamanho da
            letra para ver tudo se adaptar.
          </p>
        </FadeIn>

        {/* Prévia de capa da página inicial */}
        <section>
          <SectionHeader eyebrow="Prévia" title="Capa da página inicial" />
          <HeroCard scene="amanhecer" className="min-h-[22rem]">
            <div className="flex min-h-[22rem] flex-col justify-end p-6 md:p-8">
              <p className="text-sm font-semibold text-white/80">Segunda-feira, 24 de novembro</p>
              <h2 className="mt-1 text-[2.6rem] leading-none font-semibold">Bom dia, Maria!</h2>
              <p className="mt-3 max-w-md font-reading text-lg text-white/90 italic">
                Que a paz de Deus esteja com você neste novo dia.
              </p>
            </div>
          </HeroCard>
          <p className="mt-2 text-sm text-muted-foreground">
            Texto ilustrativo para mostrar o layout. A saudação real usa o nome do usuário e o horário.
          </p>
        </section>

        {/* Aparência e acessibilidade */}
        <section>
          <SectionHeader eyebrow="Acessibilidade" title="Aparência" />
          <Card>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-3 font-semibold">Tamanho da letra</p>
                <FontSizeControl />
              </div>
              <div>
                <p className="mb-3 font-semibold">Tema</p>
                <ThemeSelector />
              </div>
              <ReduceMotionSwitch />
            </CardContent>
          </Card>
        </section>

        {/* Marca */}
        <section>
          <SectionHeader eyebrow="Marca" title="Logotipo e paleta" />
          <div className="flex flex-wrap items-center gap-6 rounded-3xl bg-card p-6 shadow-soft">
            <Logo showSlogan />
            <span className="grid size-16 place-items-center rounded-2xl bg-[#17283E] text-[#F8F5EF]">
              <LogoMark className="size-11" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {swatches.map((s) => (
              <div key={s.hex} className="overflow-hidden rounded-2xl bg-card shadow-soft">
                <div className={`h-16 ${s.token} ${s.ring ? "border-b border-border" : ""}`} />
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{s.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tipografia */}
        <section>
          <SectionHeader eyebrow="Tipografia" title="Três vozes" />
          <Card>
            <CardContent className="space-y-6">
              <div>
                <p className="eyebrow">Títulos · Cormorant Garamond</p>
                <p className="mt-1 font-heading text-4xl font-semibold">Seu encontro diário com Deus</p>
              </div>
              <div>
                <p className="eyebrow">Interface · Nunito Sans</p>
                <p className="mt-1 text-lg">Botões, menus e textos curtos, com letras abertas e fáceis de ler.</p>
              </div>
              <div>
                <p className="eyebrow">Leitura · Lora</p>
                <div className="prose-reading mt-1">
                  <p>
                    Texto longo de reflexões, orações e da Bíblia: espaçamento generoso entre linhas para uma leitura
                    calma, inclusive em telas pequenas e com letra aumentada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Botões */}
        <section>
          <SectionHeader eyebrow="Ações" title="Botões" />
          <div className="flex flex-wrap gap-3">
            <Button>Principal</Button>
            <Button variant="gold">
              <Sparkles /> Seja Premium
            </Button>
            <Button variant="soft">Suave</Button>
            <Button variant="outline">Contorno</Button>
            <Button variant="ghost">Discreto</Button>
            <Button variant="destructive">Excluir</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="lg">Grande</Button>
            <Button size="sm">Pequeno</Button>
            <Button variant="outline" size="icon" aria-label="Ouvir">
              <Volume2 />
            </Button>
            <Button variant="outline" size="icon" aria-label="Compartilhar">
              <Share2 />
            </Button>
            <Button variant="outline" size="icon" aria-label="Favoritar">
              <Heart />
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Altura mínima de 48 px nos botões padrão (alvo de toque confortável para todas as idades).
          </p>
        </section>

        {/* Cards de conteúdo */}
        <section>
          <SectionHeader eyebrow="Conteúdo" title="Cards" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="pt-0">
              <div className="h-40">
                <Scene variant="campo" />
              </div>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <DemoBadge />
                </div>
                <CardTitle>Confiar no tempo de Deus</CardTitle>
                <CardDescription>Palavra do dia · 3 min de leitura</CardDescription>
              </CardHeader>
            </Card>
            <Card className="pt-0">
              <div className="h-40">
                <Scene variant="montanhas" />
              </div>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <PremiumBadge />
                </div>
                <CardTitle>21 dias encontrando paz</CardTitle>
                <CardDescription>Jornada · 10 min por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold">Dia 8 de 21 · 38%</span>
                </div>
                <Progress value={38} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Atalhos */}
        <section id="atalhos" className="scroll-mt-20">
          <SectionHeader eyebrow="Navegação" title="Atalhos" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ShortcutTile href="#atalhos" icon={BookOpen} label="Bíblia" hint="Continue lendo" />
            <ShortcutTile href="#atalhos" icon={HandHeart} label="Orações" hint="Para cada momento" />
            <ShortcutTile href="#atalhos" icon={Map} label="Jornadas" hint="Planos guiados" />
            <ShortcutTile href="#atalhos" icon={NotebookPen} label="Diário" hint="Só seu" />
            <ShortcutTile href="#atalhos" icon={Leaf} label="Momento de paz" hint="Respire e ore" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Nesta página os atalhos apontam para a própria página. No app, levam às seções reais.
          </p>
        </section>

        {/* Paisagens */}
        <section>
          <SectionHeader eyebrow="Imagens" title="Paisagens" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sceneVariants.map((v) => (
              <figure key={v} className="overflow-hidden rounded-3xl bg-card shadow-soft">
                <div className="aspect-[4/3]">
                  <Scene variant={v} label={sceneLabels[v]} />
                </div>
                <figcaption className="px-3 py-2 text-sm font-semibold">{sceneLabels[v]}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Ilustrações próprias do projeto (sem custo de licença). O painel permite substituir por fotografias.
          </p>
        </section>

        {/* Formulários */}
        <section>
          <SectionHeader eyebrow="Entrada de dados" title="Formulários" />
          <Card>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ds-nome" className="text-base">
                  Qual é o seu primeiro nome?
                </Label>
                <Input id="ds-nome" placeholder="Ex.: Maria" autoComplete="given-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-texto" className="text-base">
                  O que está em seu coração hoje?
                </Label>
                <Textarea id="ds-texto" placeholder="Escreva livremente. Só você poderá ler." />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Destaques da Bíblia */}
        <section>
          <SectionHeader eyebrow="Bíblia" title="Cores de destaque" />
          <div className="prose-reading rounded-3xl bg-card p-6 shadow-soft">
            <p>
              {highlights.map((h, i) => (
                <span key={h.name}>
                  <span className={`${h.cls} rounded px-1 py-0.5`}>Destaque {h.name.toLowerCase()}</span>
                  {i < highlights.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* Estados */}
        <section>
          <SectionHeader eyebrow="Estados" title="Carregando, vazio e erro" />
          <div className="grid gap-4 md:grid-cols-2">
            <CardSkeleton />
            <EmptyState
              icon={NotebookPen}
              title="Seu diário está esperando"
              description="Registre uma reflexão, uma oração ou um motivo de gratidão. Ninguém além de você verá."
            />
          </div>
          <DemoInteractions />
          <ErrorState className="mt-4" />
        </section>
      </PageContainer>
    </main>
  );
}
