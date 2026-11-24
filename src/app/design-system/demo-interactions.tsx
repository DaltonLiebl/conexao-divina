"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Demonstra as notificações (toasts) usadas para sucesso e erro. */
export function DemoInteractions() {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => toast.success("Salvo nos seus favoritos")}>
        Ver aviso de sucesso
      </Button>
      <Button variant="outline" onClick={() => toast.error("Não foi possível salvar. Tente novamente.")}>
        Ver aviso de erro
      </Button>
    </div>
  );
}
