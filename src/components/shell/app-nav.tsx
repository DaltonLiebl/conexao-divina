"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, HandHeart, Heart, Home, Map, Smile, Sun, User, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { BIBLE_TRANSLATION } from "@/lib/bible/books";

/** As 5 abas principais (pedido do briefing). */
const tabs = [
  { href: "/inicio", label: "Início", icon: Home, match: ["/inicio", "/palavra", "/versiculo", "/coracao", "/favoritos"] },
  { href: "/biblia", label: "Bíblia", icon: BookOpen, match: ["/biblia"] },
  { href: "/oracoes", label: "Orações", icon: HandHeart, match: ["/oracoes"] },
  { href: "/jornadas", label: "Jornadas", icon: Map, match: ["/jornadas"] },
  { href: "/perfil", label: "Perfil", icon: User, match: ["/perfil"] },
];

/** Atalhos extras só na barra lateral do computador. */
const extras = [
  { href: "/palavra", label: "Palavra do dia", icon: Sun },
  { href: "/versiculo", label: "Versículo do dia", icon: BookMarked },
  { href: "/coracao", label: "Como está seu coração", icon: Smile },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
];

function useActive() {
  const path = usePathname();
  return (match: string[]) => match.some((m) => path === m || path.startsWith(m + "/"));
}

export function BottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-lg pb-safe md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = isActive(match);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[0.78rem] font-semibold transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-14 place-items-center rounded-full transition-colors",
                    active && "bg-gold/20 text-gold-ink",
                  )}
                >
                  <Icon className="size-[1.35rem]" aria-hidden strokeWidth={active ? 2.4 : 2} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar() {
  const isActive = useActive();
  const item = (href: string, label: string, Icon: typeof Home, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-2xl px-4 font-semibold transition-colors",
        active ? "bg-gold/15 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className={cn("size-5", active && "text-gold-ink")} aria-hidden />
      {label}
    </Link>
  );
  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
      <Link href="/inicio" className="mb-8 px-2">
        <Logo showSlogan />
      </Link>
      <nav aria-label="Navegação principal" className="flex flex-col gap-1">
        {/* na lateral, "Início" acende só na própria página (os atalhos abaixo têm destaque próprio) */}
        {tabs.map((t) => item(t.href, t.label, t.icon, isActive(t.href === "/inicio" ? ["/inicio"] : t.match)))}
      </nav>
      <p className="mt-8 mb-2 px-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Para hoje</p>
      <nav aria-label="Atalhos" className="flex flex-col gap-1">
        {extras.map((e) => item(e.href, e.label, e.icon, isActive([e.href])))}
      </nav>
      <p className="mt-auto px-4 text-xs leading-relaxed text-muted-foreground">
        Textos bíblicos: {BIBLE_TRANSLATION.name} ({BIBLE_TRANSLATION.short}), licença CC BY 4.0.
      </p>
    </aside>
  );
}
