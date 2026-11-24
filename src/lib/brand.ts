/** Identidade do produto. Centralizado para facilitar uma futura troca de marca. */
export const brand = {
  name: "Conexão Divina",
  slogan: "Seu encontro diário com Deus",
  description:
    "Palavra do dia, versículos, orações, Bíblia, jornadas espirituais e um diário privado para fortalecer sua fé um dia de cada vez.",
  colors: {
    sand: "#F7F4EE",
    gold: "#D4B47C",
    navy: "#0B1220",
    white: "#FFFFFF",
    sage: "#819B89",
    ink: "#252525",
    night: "#0B1220",
  },
} as const;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
