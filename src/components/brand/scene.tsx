import { cn } from "@/lib/utils";

/**
 * Paisagens de capa (fotos). Servem de capa padrão para conteúdos sem foto própria.
 * Fotografias enviadas pelo painel substituem estas capas quando existirem.
 */
export const sceneVariants = ["amanhecer", "montanhas", "ceu", "noite", "campo", "mar"] as const;
export type SceneVariant = (typeof sceneVariants)[number];

export const sceneLabels: Record<SceneVariant, string> = {
  amanhecer: "Amanhecer nas montanhas",
  montanhas: "Montanhas ao pôr do sol",
  ceu: "Nuvens na hora dourada",
  noite: "Céu estrelado",
  campo: "Campo de trigo",
  mar: "Pôr do sol no mar",
};

/** Escolhe uma paisagem estável a partir de um texto (ex.: id do conteúdo). */
export function sceneFor(key: string | null | undefined): SceneVariant {
  if (!key) return "amanhecer";
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return sceneVariants[h % sceneVariants.length];
}

/** Paisagem conforme o horário: amanhecer de manhã, céu à tarde, noite à noite. */
export function sceneForHour(hour: number): SceneVariant {
  if (hour >= 5 && hour < 11) return "amanhecer";
  if (hour >= 11 && hour < 17) return "ceu";
  if (hour >= 17 && hour < 19) return "mar";
  return "noite";
}

/** Foto de cada paisagem (Unsplash, licença gratuita para uso comercial; ver public/images/CREDITOS.md). */
export const scenePhotos: Record<SceneVariant, string> = {
  amanhecer: "/images/amanhecer.webp",
  montanhas: "/images/montanhas.webp",
  ceu: "/images/ceu.webp",
  noite: "/images/noite.webp",
  campo: "/images/campo.webp",
  mar: "/images/mar.webp",
};

export function Scene({
  variant,
  className,
  label,
  src,
  priority,
}: {
  variant: SceneVariant;
  className?: string;
  /** Texto alternativo. Sem ele a imagem é tratada como decorativa. */
  label?: string;
  /** Foto específica (substitui a paisagem padrão). */
  src?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fotos locais já otimizadas (webp)
    <img
      src={src ?? scenePhotos[variant]}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("block size-full object-cover", className)}
    />
  );
}
