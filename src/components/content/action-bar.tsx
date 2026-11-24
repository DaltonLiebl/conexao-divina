"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Heart, Pause, Share2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites, type Favorite } from "@/lib/local-store";

type Props = {
  /** Texto usado para copiar, compartilhar e ouvir. */
  shareText: string;
  shareTitle: string;
  favorite?: Omit<Favorite, "savedAt">;
  /** Texto lido em voz alta (padrão: shareText). */
  listenText?: string;
  copy?: boolean;
  className?: string;
};

export function ActionBar({ shareText, shareTitle, favorite, listenText, copy = true, className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {favorite ? <FavoriteButton fav={favorite} /> : null}
      <ListenButton text={listenText ?? shareText} />
      {copy ? <CopyButton text={shareText} /> : null}
      <ShareButton text={shareText} title={shareTitle} />
    </div>
  );
}

export function FavoriteButton({ fav, compact }: { fav: Omit<Favorite, "savedAt">; compact?: boolean }) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(fav.key);
  return (
    <Button
      variant={on ? "soft" : "outline"}
      size={compact ? "icon" : "default"}
      aria-pressed={on}
      aria-label={on ? "Remover dos favoritos" : "Salvar nos favoritos"}
      onClick={() => {
        const added = toggle(fav);
        toast.success(added ? "Salvo nos seus favoritos" : "Removido dos favoritos");
      }}
    >
      <Heart className={cn(on && "fill-current text-rose-600 dark:text-rose-400")} />
      {compact ? null : on ? "Salvo" : "Favoritar"}
    </Button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Texto copiado");
          setTimeout(() => setDone(false), 2000);
        } catch {
          toast.error("Não foi possível copiar neste aparelho.");
        }
      }}
    >
      {done ? <Check /> : <Copy />}
      Copiar
    </Button>
  );
}

function ShareButton({ text, title }: { text: string; title: string }) {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({ title, text: `${text}\n\n${url}` });
            return;
          } catch (e) {
            if ((e as Error).name === "AbortError") return;
          }
        }
        // Sem compartilhamento nativo (computador): abre o WhatsApp Web
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`, "_blank", "noopener");
      }}
    >
      <Share2 />
      Compartilhar
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Ouvir: síntese de voz do próprio aparelho (Web Speech API, sem custo).

const noop = () => () => {};
function useSpeechSupported() {
  return useSyncExternalStore(
    noop,
    () => "speechSynthesis" in window,
    () => false,
  );
}

function ListenButton({ text }: { text: string }) {
  const supported = useSpeechSupported();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!supported) return null;

  const start = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.92;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("pt-br"));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <Button
      variant={speaking ? "soft" : "outline"}
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          window.speechSynthesis.cancel();
          setSpeaking(false);
        } else start();
      }}
    >
      {speaking ? <Pause /> : <Volume2 />}
      {speaking ? "Parar" : "Ouvir"}
    </Button>
  );
}
