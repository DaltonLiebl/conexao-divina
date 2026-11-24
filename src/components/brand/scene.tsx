import { cn } from "@/lib/utils";

/**
 * Paisagens ilustradas em SVG (arte própria do projeto, sem licença de terceiros).
 * Servem de capa padrão para conteúdos sem foto e de fundo da página inicial.
 * Fotografias enviadas pelo painel substituem estas capas quando existirem.
 */
export const sceneVariants = ["amanhecer", "montanhas", "ceu", "noite", "campo", "mar"] as const;
export type SceneVariant = (typeof sceneVariants)[number];

export const sceneLabels: Record<SceneVariant, string> = {
  amanhecer: "Amanhecer nas montanhas",
  montanhas: "Montanhas azuis",
  ceu: "Céu com raios de luz",
  noite: "Céu estrelado",
  campo: "Campos verdes",
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

export function Scene({
  variant,
  className,
  label,
}: {
  variant: SceneVariant;
  className?: string;
  /** Texto alternativo. Sem ele a imagem é tratada como decorativa. */
  label?: string;
}) {
  const id = `sc-${variant}`;
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block size-full", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {variant === "amanhecer" && <Amanhecer id={id} />}
      {variant === "montanhas" && <Montanhas id={id} />}
      {variant === "ceu" && <Ceu id={id} />}
      {variant === "noite" && <Noite id={id} />}
      {variant === "campo" && <Campo id={id} />}
      {variant === "mar" && <Mar id={id} />}
    </svg>
  );
}

function Amanhecer({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3d5a" />
          <stop offset="0.45" stopColor="#c99a86" />
          <stop offset="0.72" stopColor="#f0c48e" />
          <stop offset="1" stopColor="#f8e7c4" />
        </linearGradient>
        <linearGradient id={`${id}-m3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f3350" />
          <stop offset="1" stopColor="#17283e" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="205" cy="200" r="70" fill="#ffe2a8" opacity="0.55" filter={`url(#${id}-blur)`} />
      <circle cx="205" cy="200" r="30" fill="#fde3a7" />
      <path d="M0 205 L55 168 L95 188 L150 140 L205 182 L255 150 L310 185 L350 160 L400 180 V300 H0Z" fill="#8f7f95" opacity="0.75" />
      <path d="M0 225 L45 200 L105 222 L165 185 L225 220 L280 196 L340 224 L400 205 V300 H0Z" fill="#5d6b85" />
      <rect x="0" y="215" width="400" height="30" fill="#f8e7c4" opacity="0.25" filter={`url(#${id}-soft)`} />
      <path d="M0 250 L70 228 L130 246 L200 222 L270 248 L330 232 L400 246 V300 H0Z" fill={`url(#${id}-m3)`} />
    </>
  );
}

function Montanhas({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9cbdc" />
          <stop offset="1" stopColor="#f3efe6" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="300" cy="80" r="45" fill="#fff6df" opacity="0.8" filter={`url(#${id}-blur)`} />
      <path d="M0 170 L60 120 L110 150 L170 90 L230 140 L290 100 L350 135 L400 115 V300 H0Z" fill="#a6b8cb" />
      <path d="M170 90 L190 104 L182 104 L176 98 L168 106 L158 100Z" fill="#ffffff" opacity="0.8" />
      <path d="M0 200 L50 165 L120 195 L190 150 L260 190 L320 160 L400 185 V300 H0Z" fill="#7891ab" />
      <rect x="0" y="185" width="400" height="34" fill="#eef2f4" opacity="0.4" filter={`url(#${id}-soft)`} />
      <path d="M0 232 L80 200 L150 228 L220 196 L300 226 L360 206 L400 218 V300 H0Z" fill="#3f5878" />
      <path d="M0 262 L90 238 L170 258 L250 236 L330 258 L400 244 V300 H0Z" fill="#17283e" />
    </>
  );
}

function Ceu({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb0cf" />
          <stop offset="0.6" stopColor="#d9e4ec" />
          <stop offset="1" stopColor="#f8f5ef" />
        </linearGradient>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <g fill={`url(#${id}-ray)`}>
        <path d="M250 0 L280 0 L200 300 L150 300Z" />
        <path d="M300 0 L318 0 L280 300 L250 300Z" opacity="0.7" />
        <path d="M210 0 L228 0 L110 300 L80 300Z" opacity="0.6" />
      </g>
      <circle cx="265" cy="10" r="50" fill="#fff8e6" filter={`url(#${id}-blur)`} />
      <g fill="#ffffff" filter={`url(#${id}-soft)`}>
        <ellipse cx="90" cy="110" rx="70" ry="18" opacity="0.85" />
        <ellipse cx="130" cy="98" rx="45" ry="16" opacity="0.9" />
        <ellipse cx="320" cy="150" rx="80" ry="16" opacity="0.75" />
        <ellipse cx="200" cy="215" rx="140" ry="22" opacity="0.8" />
        <ellipse cx="60" cy="235" rx="90" ry="20" opacity="0.9" />
        <ellipse cx="360" cy="245" rx="80" ry="20" opacity="0.9" />
      </g>
    </>
  );
}

function Noite({ id }: { id: string }) {
  const stars = [
    [30, 40, 1.2], [70, 90, 0.9], [110, 30, 1.4], [150, 70, 0.8], [190, 25, 1], [235, 60, 1.3],
    [280, 35, 0.9], [320, 80, 1.1], [360, 30, 1.4], [385, 95, 0.8], [50, 140, 0.8], [130, 120, 1],
    [210, 110, 0.7], [260, 130, 1], [345, 140, 0.9], [20, 95, 0.7], [95, 60, 0.6], [300, 110, 0.7],
  ] as const;
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1524" />
          <stop offset="0.7" stopColor="#1d3354" />
          <stop offset="1" stopColor="#34507a" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <g fill="#fdf6e3">
        {stars.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} opacity={0.55 + r * 0.25} />
        ))}
      </g>
      <circle cx="300" cy="75" r="34" fill="#f6e7c4" opacity="0.35" filter={`url(#${id}-blur)`} />
      <path d="M312 58a22 22 0 1 0 6 36 18 18 0 1 1 -6 -36z" fill="#f6e7c4" />
      <path d="M0 230 L70 205 L140 225 L210 198 L290 222 L350 206 L400 216 V300 H0Z" fill="#1a2b45" />
      <path d="M0 258 L90 236 L170 256 L250 234 L330 256 L400 244 V300 H0Z" fill="#0a1220" />
    </>
  );
}

function Campo({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2dcae" />
          <stop offset="0.6" stopColor="#f7eedb" />
          <stop offset="1" stopColor="#f8f5ef" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="110" cy="120" r="60" fill="#ffe7b0" opacity="0.7" filter={`url(#${id}-blur)`} />
      <circle cx="110" cy="128" r="22" fill="#fbe2a6" />
      <path d="M0 190 Q100 150 200 178 T400 165 V300 H0Z" fill="#b7c7b4" />
      <path d="M0 218 Q120 182 230 210 T400 196 V300 H0Z" fill="#94ab97" />
      <path d="M0 250 Q140 220 260 246 T400 236 V300 H0Z" fill="#6c8774" />
      <path d="M0 278 Q160 258 300 276 T400 270 V300 H0Z" fill="#4c6655" />
      <g stroke="#4c6655" strokeWidth="2" strokeLinecap="round">
        <path d="M320 196 v-16" />
      </g>
      <circle cx="320" cy="176" r="10" fill="#5f7a68" />
    </>
  );
}

function Mar({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5f80" />
          <stop offset="0.55" stopColor="#e2a98a" />
          <stop offset="1" stopColor="#f6d6a6" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f7894" />
          <stop offset="1" stopColor="#17283e" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="200" cy="185" r="65" fill="#ffd9a0" opacity="0.6" filter={`url(#${id}-blur)`} />
      <circle cx="200" cy="190" r="26" fill="#fde0a6" />
      <rect x="0" y="190" width="400" height="110" fill={`url(#${id}-sea)`} />
      <g stroke="#f6d6a6" strokeLinecap="round" opacity="0.8">
        <path d="M172 200 h56" strokeWidth="3" />
        <path d="M180 212 h40" strokeWidth="2.5" />
        <path d="M186 224 h28" strokeWidth="2" />
        <path d="M191 236 h18" strokeWidth="1.6" />
        <path d="M195 248 h10" strokeWidth="1.2" />
      </g>
      <g stroke="#ffffff" strokeLinecap="round" opacity="0.18" strokeWidth="1.5">
        <path d="M30 230 h60" />
        <path d="M300 220 h70" />
        <path d="M90 262 h80" />
        <path d="M260 270 h90" />
      </g>
    </>
  );
}
