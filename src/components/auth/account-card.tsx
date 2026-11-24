"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase/client";
import { authEnabled } from "@/lib/supabase/config";
import { useUser } from "./use-session";

/** Card "Sua conta" do Perfil: entrar/criar conta, sair e excluir a conta. */
export function AccountCard() {
  const router = useRouter();
  const user = useUser();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  if (!authEnabled)
    return <p className="text-muted-foreground">As contas ainda não estão disponíveis. Você pode usar o app normalmente.</p>;

  if (user === undefined)
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );

  if (!user)
    return (
      <>
        <p className="text-muted-foreground">
          Crie uma conta grátis para guardar seu caminho com Deus e acessar de qualquer aparelho.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button render={<Link href="/cadastro" />} nativeButton={false}>
            Criar conta grátis
          </Button>
          <Button variant="outline" render={<Link href="/entrar" />} nativeButton={false}>
            Já tenho conta
          </Button>
        </div>
      </>
    );

  const name = (user.user_metadata?.display_name as string | undefined) ?? "";

  return (
    <>
      <p className="text-muted-foreground">Você está conectado como</p>
      <p className="mt-0.5 font-semibold break-all">
        {name ? `${name} · ` : ""}
        {user.email}
      </p>
      <Button
        variant="outline"
        className="mt-4"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await getSupabase()!.auth.signOut();
          toast.success("Você saiu da sua conta");
          setBusy(false);
          router.refresh();
        }}
      >
        <LogOut /> Sair
      </Button>

      <div className="mt-6 border-t border-border pt-5">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
          >
            <Trash2 className="size-4" /> Excluir minha conta
          </button>
        ) : (
          <div className="rounded-2xl bg-destructive/8 p-4 ring-1 ring-destructive/25">
            <p className="font-semibold text-destructive">Excluir a conta para sempre?</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Sua conta e todos os dados guardados nela serão apagados e não poderão ser recuperados. Para confirmar,
              digite <strong className="text-foreground">EXCLUIR</strong>.
            </p>
            <Input
              className="mt-3"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              aria-label="Digite EXCLUIR para confirmar"
              autoComplete="off"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="destructive"
                disabled={typed.trim().toUpperCase() !== "EXCLUIR" || busy}
                onClick={async () => {
                  setBusy(true);
                  const supabase = getSupabase()!;
                  const { error } = await supabase.rpc("delete_my_account");
                  if (error) {
                    toast.error("Não foi possível excluir agora. Tente novamente.");
                    setBusy(false);
                    return;
                  }
                  await supabase.auth.signOut();
                  toast.success("Sua conta foi excluída");
                  router.replace("/inicio");
                  router.refresh();
                }}
              >
                {busy ? <Loader2 className="animate-spin" /> : <Trash2 />} Excluir definitivamente
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirming(false);
                  setTyped("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
