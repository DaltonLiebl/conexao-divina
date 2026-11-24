"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocalProfile } from "@/lib/local-store";
import { useIsClient } from "@/components/appearance/appearance-provider";

export function NameEditor() {
  const [profile, setProfile] = useLocalProfile();
  const ready = useIsClient();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? (ready ? profile.name : "");
  const changed = draft !== null && draft.trim() !== profile.name;

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setProfile({ name: value.trim().slice(0, 40), askedName: true });
        setDraft(null);
        toast.success("Nome salvo");
      }}
    >
      <label htmlFor="nome-perfil" className="sr-only">
        Primeiro nome
      </label>
      <Input
        id="nome-perfil"
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Seu primeiro nome"
        autoComplete="given-name"
        maxLength={40}
        className="sm:flex-1"
      />
      <Button type="submit" disabled={!changed}>
        Salvar
      </Button>
    </form>
  );
}

/** Apaga nome, favoritos, destaques e progresso guardados neste aparelho. */
export function ResetDeviceData() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" className="mt-4" />}>
        <Trash2 /> Apagar dados deste aparelho
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar seus dados deste aparelho?</AlertDialogTitle>
          <AlertDialogDescription>
            Seu nome, favoritos, destaques da Bíblia, última leitura e o progresso das jornadas serão apagados. Isso não
            pode ser desfeito.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              try {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("cd:"))
                  .forEach((k) => localStorage.removeItem(k));
              } catch {}
              // recarga completa de propósito: todos os estados locais voltam ao zero
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.href = "/inicio";
            }}
          >
            Apagar tudo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
