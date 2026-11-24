"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  HandHeart,
  Heart,
  HeartPulse,
  Home,
  Map,
  Search,
  Settings,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/logo";
import { brand } from "@/lib/brand";
import { BIBLE_TRANSLATION } from "@/lib/bible/books";
import { useLocalProfile } from "@/lib/local-store";
import { useIsClient } from "@/components/appearance/appearance-provider";

type NavItem = { href: string; label: string; icon: LucideIcon; match?: string[] };

/** Menu lateral organizado por categorias. Só entram telas que já existem. */
const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Principal",
    items: [
      { href: "/inicio", label: "Início", icon: Home },
      { href: "/biblia", label: "Bíblia Sagrada", icon: BookOpen },
      { href: "/oracoes", label: "Orações", icon: HandHeart },
      { href: "/devocionais", label: "Devocionais", icon: Sun, match: ["/devocionais", "/palavra"] },
      { href: "/jornadas", label: "Jornadas espirituais", icon: Map },
    ],
  },
  {
    title: "Minha espiritualidade",
    items: [
      { href: "/coracao", label: "Meu coração", icon: HeartPulse },
      { href: "/versiculo", label: "Versículo do dia", icon: BookMarked },
      { href: "/favoritos", label: "Meus favoritos", icon: Heart },
    ],
  },
  {
    title: "Conta",
    items: [{ href: "/perfil", label: "Perfil e ajustes", icon: Settings }],
  },
];

/** As 5 abas do celular. */
const tabs: NavItem[] = [
  {
    href: "/inicio",
    label: "Início",
    icon: Home,
    match: ["/inicio", "/coracao", "/favoritos", "/versiculo", "/devocionais", "/palavra"],
  },
  { href: "/biblia", label: "Bíblia", icon: BookOpen },
  { href: "/oracoes", label: "Orações", icon: HandHeart },
  { href: "/jornadas", label: "Jornadas", icon: Map },
  { href: "/perfil", label: "Perfil", icon: User },
];

function useActive() {
  const path = usePathname();
  return (item: NavItem) => (item.match ?? [item.href]).some((m) => path === m || path.startsWith(m + "/"));
}

// ---------------------------------------------------------------------------
// Celular: barra inferior

export function BottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/92 backdrop-blur-xl pb-safe md:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {tabs.map((t) => {
          const active = isActive(t);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-medium transition-colors",
                  active ? "text-gold-ink" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full bg-gold transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon className="size-[1.4rem]" aria-hidden strokeWidth={active ? 2.2 : 1.8} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Tablet: trilho de ícones · Computador: menu lateral completo (≈250px)

export function Sidebar() {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex md:w-[5.5rem] lg:w-[15rem]">
      <Link
        href="/inicio"
        className="flex h-[4.5rem] shrink-0 items-center justify-center border-b border-sidebar-border px-4 lg:justify-start lg:px-5"
        aria-label={`${brand.name}, ir para o início`}
      >
        <LogoMark className="size-10 lg:hidden" />
        <Logo className="hidden lg:inline-flex" showSlogan compact />
      </Link>

      <nav aria-label="Menu" className="no-scrollbar flex-1 overflow-y-auto px-3 py-5 lg:px-3.5">
        {groups.map((g, gi) => (
          <div key={g.title} className={cn(gi > 0 && "mt-6")}>
            <p className="mb-2 hidden px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 lg:block">
              {g.title}
            </p>
            {gi > 0 ? <div className="mx-auto mb-4 h-px w-8 bg-sidebar-border lg:hidden" aria-hidden /> : null}
            <ul className="flex flex-col gap-1">
              {g.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 text-[0.92rem] font-medium transition-colors lg:justify-start",
                        active
                          ? "bg-gold/12 text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-2 left-0 w-[3px] rounded-full bg-gold transition-opacity",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <Icon
                        className={cn("size-5 shrink-0", active ? "text-gold" : "group-hover:text-gold")}
                        aria-hidden
                        strokeWidth={active ? 2.1 : 1.8}
                      />
                      <span className="sr-only lg:not-sr-only lg:truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="hidden border-t border-sidebar-border p-4 lg:block">
        <div className="rounded-2xl bg-linear-to-br from-gold/14 to-transparent p-4 ring-1 ring-gold/20">
          <p className="font-heading text-[1.02rem] leading-snug italic text-gold-ink">
            Lâmpada para os meus pés é a tua palavra.
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">Salmos 119:105</p>
        </div>
        <p className="mt-3 px-1 text-[0.7rem] leading-relaxed text-muted-foreground/80">
          Textos bíblicos: {BIBLE_TRANSLATION.name} ({BIBLE_TRANSLATION.short}), CC BY 4.0.
        </p>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Cabeçalho do conteúdo: busca na Bíblia, favoritos e perfil.

const ROOTS = ["/inicio", "/biblia", "/oracoes", "/jornadas", "/perfil", "/devocionais", "/coracao", "/favoritos"];

export function AppHeader() {
  const path = usePathname();
  const isRoot = ROOTS.includes(path);
  const [profile] = useLocalProfile();
  const ready = useIsClient();
  const initial = ready && profile.name.trim() ? profile.name.trim()[0]!.toUpperCase() : null;

  return (
    <header
      className={cn(
        "z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl pt-safe md:sticky md:top-0",
        // no celular, só nas telas principais (as internas têm a barra "voltar")
        isRoot ? "block" : "hidden md:block",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[88rem] items-center 2xl:max-w-[104rem] gap-3 px-5 md:h-[4.5rem] md:px-8 xl:px-12">
        <Link href="/inicio" className="md:hidden" aria-label={`${brand.name}, ir para o início`}>
          <Logo compact />
        </Link>

        <form action="/biblia/busca" role="search" className="relative hidden max-w-md flex-1 md:block">
          <label htmlFor="busca-topo" className="sr-only">
            Buscar na Bíblia
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-[1.1rem] -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="busca-topo"
            name="q"
            type="search"
            placeholder="Buscar na Bíblia: paz, esperança, pastor…"
            className="h-11 w-full rounded-full border border-border bg-card/70 pl-11 pr-4 text-[0.95rem] outline-none transition-colors placeholder:text-muted-foreground/80 focus-visible:border-gold/60 focus-visible:ring-3 focus-visible:ring-gold/20"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/biblia/busca"
            aria-label="Buscar na Bíblia"
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:hidden"
          >
            <Search className="size-5" />
          </Link>
          <Link
            href="/favoritos"
            aria-label="Meus favoritos"
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/perfil"
            aria-label="Perfil e ajustes"
            className="ml-1 grid size-10 place-items-center rounded-full bg-linear-to-br from-[#e8d5ac] to-[#b8955a] font-heading text-lg font-semibold text-[#0b1220] ring-2 ring-gold/25 transition-transform hover:scale-105"
          >
            {initial ?? <User className="size-5" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
