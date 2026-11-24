"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const noop = () => () => {};
function useEnv() {
  return useSyncExternalStore(
    noop,
    () => {
      const ua = navigator.userAgent;
      const ios = /iphone|ipad|ipod/i.test(ua);
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      return `${ios ? "ios" : "other"}|${standalone ? "installed" : "browser"}`;
    },
    () => "other|browser",
  );
}

/** Instalar na tela inicial (Android/computador: botão; iPhone: instruções). */
export function InstallApp() {
  const [ios, mode] = useEnv().split("|");
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "installed" || installed)
    return <p className="text-muted-foreground">O Conexão Divina já está instalado neste aparelho. 🙏</p>;

  if (ios === "ios")
    return (
      <ol className="space-y-3 text-[1.05rem]">
        <li className="flex items-start gap-3">
          <Share className="mt-0.5 size-5 shrink-0 text-gold-ink" />
          <span>
            No Safari, toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima).
          </span>
        </li>
        <li className="flex items-start gap-3">
          <SquarePlus className="mt-0.5 size-5 shrink-0 text-gold-ink" />
          <span>
            Escolha <strong>Adicionar à Tela de Início</strong> e confirme.
          </span>
        </li>
      </ol>
    );

  if (prompt)
    return (
      <>
        <p className="mb-4 text-muted-foreground">Tenha o Conexão Divina na tela inicial, como um aplicativo.</p>
        <Button
          size="lg"
          onClick={async () => {
            await prompt.prompt();
            const choice = await prompt.userChoice;
            if (choice.outcome === "accepted") setInstalled(true);
            setPrompt(null);
          }}
        >
          <Download /> Instalar aplicativo
        </Button>
      </>
    );

  return (
    <p className="text-muted-foreground">
      No celular Android, abra o menu do navegador (⋮) e toque em <strong>Instalar aplicativo</strong> ou{" "}
      <strong>Adicionar à tela inicial</strong>. No computador, use o ícone de instalar na barra de endereço.
    </p>
  );
}
