import { Fragment } from "react";

/**
 * Mostra o texto bíblico exatamente como está na fonte. As palavras entre
 * colchetes (acréscimos dos tradutores) aparecem em itálico, como nas Bíblias impressas.
 */
export function VerseText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]*\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") && p.endsWith("]") ? (
          <em key={i} className="text-muted-foreground" title="Palavra acrescentada pelos tradutores">
            {p.slice(1, -1)}
          </em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Texto puro, sem colchetes (para copiar, compartilhar e ouvir). */
export function plainVerse(text: string) {
  return text.replace(/\[([^\]]*)\]/g, "$1").replace(/\s+/g, " ").trim();
}
