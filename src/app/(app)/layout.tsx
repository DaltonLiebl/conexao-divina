import { BottomNav, Sidebar } from "@/components/shell/app-nav";

/** Moldura do app: barra lateral no computador, barra inferior no celular. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main id="conteudo" className="min-w-0 flex-1">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
