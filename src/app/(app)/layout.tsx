import { AppHeader, BottomNav, Sidebar } from "@/components/shell/app-nav";

/**
 * Moldura do app.
 * Celular (< 768px): barra inferior · Tablet (768–1023px): trilho de ícones
 * Computador (≥ 1024px): menu lateral completo. Cabeçalho com busca a partir do tablet.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main id="conteudo" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
