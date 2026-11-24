"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Bookmark,
  BookOpen,
  Feather,
  Flag,
  HandHeart,
  Heart,
  Home,
  Moon,
  Search,
  Star,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/logo";
import { brand } from "@/lib/brand";
import { useLocalProfile } from "@/lib/local-store";
import { useIsClient } from "@/components/appearance/appearance-provider";

type NavItem = { href: string; label: string; icon: LucideIcon; match?: string[] };

/** Menu lateral organizado por categorias. Só entram telas que já existem. */
const groups: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/inicio", label: "Início", icon: Home },
      { href: "/biblia", label: "Bíblia Sagrada", icon: BookOpen },
      { href: "/oracoes", label: "Orações", icon: HandHeart },
      { href: "/devocionais", label: "Devocionais", icon: Feather, match: ["/devocionais", "/palavra"] },
      { href: "/jornadas", label: "Jornadas espirituais", icon: Flag },
    ],
  },
  {
    title: "Minha espiritualidade",
    items: [
      { href: "/coracao", label: "Meu coração", icon: Heart },
      { href: "/versiculo", label: "Versículo do dia", icon: Bookmark },
      { href: "/favoritos", label: "Meus favoritos", icon: Star },
      { href: "/progresso", label: "Meu progresso", icon: BarChart3 },
    ],
  },
  {
    title: "Conta",
    items: [{ href: "/perfil", label: "Perfil e ajustes", icon: User }],
  },
];

/** As 5 abas do celular. */
const tabs: NavItem[] = [
  {
    href: "/inicio",
    label: "Início",
    icon: Home,
    match: ["/inicio", "/coracao", "/favoritos", "/versiculo", "/devocionais", "/palavra", "/progresso"],
  },
  { href: "/biblia", label: "Bíblia", icon: BookOpen },
  { href: "/oracoes", label: "Orações", icon: HandHeart },
  { href: "/jornadas", label: "Jornadas", icon: Flag },
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
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-medium transition-colors",
                  active ? "text-gold-ink" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-14 place-items-center rounded-full transition-colors",
                    active && "bg-linear-to-r from-[#e8d5ac] to-[#c9a66b] text-[#0b1220]",
                  )}
                >
                  <Icon className="size-[1.25rem]" aria-hidden strokeWidth={active ? 2.2 : 1.8} />
                </span>
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
        className="flex shrink-0 justify-center px-4 pb-5 pt-6"
        aria-label={`${brand.name}, ir para o início`}
      >
        <LogoMark className="h-10 lg:hidden" />
        <Logo className="hidden lg:inline-flex" stacked showSlogan />
      </Link>

      <nav aria-label="Menu" className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4 lg:px-3.5">
        {groups.map((g, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-5 border-t border-sidebar-border pt-5")}>
            {g.title ? (
              <p className="mb-2 hidden px-3 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80 lg:block">
                {g.title}
              </p>
            ) : null}
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
                        "group flex min-h-11 items-center justify-center gap-3.5 rounded-xl px-3.5 text-[0.95rem] font-medium transition-all lg:justify-start",
                        active
                          ? "bg-linear-to-r from-[#e8d5ac] to-[#c9a66b] font-semibold text-[#0b1220] shadow-[0_8px_24px_-10px_rgb(212_180_124/0.6)]"
                          : "text-foreground/85 hover:bg-sidebar-accent hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn("size-5 shrink-0", !active && "text-foreground/70 group-hover:text-gold")}
                        aria-hidden
                        strokeWidth={active ? 2.2 : 1.7}
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

      {/* Versículo com foto (só no computador e com altura suficiente) */}
      <div className="relative hidden shrink-0 overflow-hidden [@media(min-width:1024px)_and_(min-height:940px)]:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- foto local otimizada */}
        <img src="/images/orando.webp" alt="" aria-hidden className="h-32 w-full object-cover object-[70%_center]" loading="lazy" />
        <div className="absolute inset-0 bg-linear-to-b from-sidebar via-sidebar/10 to-sidebar" />
        <figure className="relative -mt-10 mx-3.5 mb-4 rounded-2xl bg-white/95 p-4 shadow-soft ring-1 ring-border backdrop-blur dark:bg-[#101b2d]/90 dark:ring-white/8">
          <span aria-hidden className="font-heading text-2xl leading-none text-gold">
            “
          </span>
          <blockquote className="-mt-1 font-heading text-[0.95rem] leading-snug text-foreground/85 italic">
            Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.
          </blockquote>
          <figcaption className="mt-2 text-xs font-semibold text-gold-ink">Salmos 119:105</figcaption>
        </figure>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Cabeçalho: saudação, busca, tema e perfil.

const noop = () => () => {};
const useHour = () =>
  useSyncExternalStore(
    noop,
    () => new Date().getHours(),
    () => 8,
  );

export function greetingFor(hour: number) {
  if (hour >= 5 && hour < 12) return { hello: "Bom dia", blessing: "Que a paz de Deus esteja com você neste novo dia." };
  if (hour >= 12 && hour < 18) return { hello: "Boa tarde", blessing: "Que a presença de Deus renove suas forças nesta tarde." };
  return { hello: "Boa noite", blessing: "Descanse no cuidado de Deus. Ele guarda você esta noite." };
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const ready = useIsClient();
  const dark = !ready || resolvedTheme !== "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
      className="relative flex h-10 w-[4.5rem] shrink-0 items-center rounded-full bg-card shadow-soft ring-1 ring-border transition-colors hover:ring-gold/40"
    >
      <span
        className={cn(
          "absolute grid size-8 place-items-center rounded-full bg-linear-to-br from-[#e8d5ac] to-[#c9a66b] text-[#0b1220] shadow transition-all duration-300",
          dark ? "left-1" : "left-[2.3rem]",
        )}
      >
        {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </span>
    </button>
  );
}

export function AppHeader() {
  const path = usePathname();
  const isHome = path === "/inicio";
  const isRoot = ["/inicio", "/biblia", "/oracoes", "/jornadas", "/perfil", "/devocionais", "/coracao", "/favoritos", "/progresso"].includes(path);
  const [profile] = useLocalProfile();
  const ready = useIsClient();
  const hour = useHour();
  const { hello, blessing } = greetingFor(hour);
  const name = ready ? profile.name.trim() : "";
  const initial = name ? name[0]!.toUpperCase() : null;

  return (
    <header
      className={cn(
        "z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl pt-safe md:sticky md:top-0",
        isRoot ? "block" : "hidden md:block",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-4 px-5 md:h-[4.75rem] md:px-8 xl:px-12 2xl:max-w-[104rem]">
        <Link href="/inicio" className="md:hidden" aria-label={`${brand.name}, ir para o início`}>
          <Logo compact />
        </Link>

        {/* saudação (tablet/computador) */}
        <div className={cn("hidden min-w-0 md:block", !isHome && "lg:block md:hidden")}>
          <p className="truncate font-heading text-[1.35rem] leading-tight font-semibold">
            {hello}
            {name ? `, ${name}` : ""}!
          </p>
          <p className="truncate text-[0.82rem] text-muted-foreground">{blessing}</p>
        </div>

        <form action="/biblia/busca" role="search" className="relative ml-auto hidden w-full max-w-md md:block xl:mx-auto">
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

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <Link
            href="/biblia/busca"
            aria-label="Buscar na Bíblia"
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:hidden"
          >
            <Search className="size-5" />
          </Link>
          <ThemeToggle />
          <Link
            href="/perfil"
            aria-label="Perfil e ajustes"
            className="grid size-10 place-items-center rounded-full bg-linear-to-br from-[#24395a] to-[#0b1220] font-heading dark:from-[#8a6a3a] dark:to-[#5c4524] text-lg font-semibold text-[#f5e9d0] ring-2 ring-gold/30 transition-transform hover:scale-105"
          >
            {initial ?? <User className="size-5" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
