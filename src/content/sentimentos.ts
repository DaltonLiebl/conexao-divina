import type { Feeling } from "./types";

/** "Como está seu coração hoje?" */
export const sentimentos: Feeling[] = [
  {
    slug: "feliz",
    label: "Feliz",
    emoji: "😊",
    tone: "joy",
    welcome: "Que alegria saber que você está feliz! Deus se alegra com você.",
    ref: { book: "PSA", chapter: 118, verse: 24 },
    reflection: [
      "A alegria é um presente de Deus, e merece ser vivida e agradecida. Os dias bons também são momentos de encontro com Ele.",
      "Aproveite este dia reconhecendo de onde vêm as bênçãos. E, se puder, compartilhe essa alegria com alguém que esteja precisando.",
    ],
    prayer:
      "Senhor, obrigado por este dia feliz. Toda alegria verdadeira vem de Ti. Que eu não me esqueça de Te agradecer e que a minha alegria alcance outras pessoas. Amém.",
    reading: { book: "PSA", chapter: 100 },
    readingWhy: "Um salmo curto de louvor e alegria na presença de Deus.",
  },
  {
    slug: "triste",
    label: "Triste",
    emoji: "😢",
    tone: "heavy",
    welcome: "Sinto muito que você esteja triste. Você não está sozinho nesse momento.",
    ref: { book: "PSA", chapter: 30, verse: 5 },
    reflection: [
      "A tristeza faz parte da vida, e a Bíblia não a esconde. Jesus chorou. Davi derramou lágrimas em muitos salmos. Você pode levar a sua tristeza a Deus do jeito que ela é.",
      "O choro pode durar uma noite, mas a alegria vem pela manhã. Ainda que hoje doa, essa não é a última palavra sobre a sua vida.",
    ],
    prayer:
      "Pai, o meu coração está triste. Eu não preciso fingir diante de Ti. Abraça-me com o Teu amor, consola-me e traz de volta a alegria no tempo certo. Amém.",
    reading: { book: "PSA", chapter: 42 },
    readingWhy: "Um salmo de quem está abatido, mas escolhe esperar em Deus.",
  },
  {
    slug: "ansioso",
    label: "Ansioso",
    emoji: "😟",
    tone: "heavy",
    welcome: "Respire fundo. Vamos entregar essa ansiedade a Deus, juntos.",
    ref: { book: "MAT", chapter: 6, verse: 34 },
    reflection: [
      "A ansiedade nos faz viver o amanhã antes da hora. Jesus nos convida a viver um dia de cada vez, confiando que o Pai já está cuidando do que vem depois.",
      "Experimente agora: inspire devagar, segure por alguns segundos e solte. Diga a Deus o que está pesando. Você não precisa resolver tudo hoje.",
    ],
    prayer:
      "Senhor, a minha mente está agitada e o meu coração apertado. Eu Te entrego o dia de amanhã. Dá-me a Tua paz para viver apenas o dia de hoje. Amém.",
    reading: { book: "MAT", chapter: 6 },
    readingWhy: "Jesus fala sobre não andar ansioso e confiar no cuidado do Pai.",
  },
  {
    slug: "desanimado",
    label: "Desanimado",
    emoji: "😔",
    tone: "heavy",
    welcome: "Está tudo bem não estar bem. Deus entende o seu cansaço.",
    ref: { book: "PSA", chapter: 42, verse: 11 },
    reflection: [
      "O salmista conversa com a própria alma: \"Por que estás abatida?\". Às vezes, também precisamos lembrar ao nosso coração em quem está a nossa esperança.",
      "O desânimo não define quem você é. Ele passa. Enquanto isso, dê pequenos passos e permita que Deus renove as suas forças aos poucos.",
    ],
    prayer:
      "Deus, eu estou sem ânimo. Renova as minhas forças e devolve a esperança ao meu coração. Ajuda-me a dar um pequeno passo hoje. Amém.",
    reading: { book: "ISA", chapter: 40 },
    readingWhy: "Isaías fala da força que Deus dá aos cansados.",
  },
  {
    slug: "com-medo",
    label: "Com medo",
    emoji: "😨",
    tone: "heavy",
    welcome: "O medo é real, mas Deus é maior. Ele está com você agora.",
    ref: { book: "PSA", chapter: 56, verse: 3 },
    reflection: [
      "Davi não diz que nunca sentiu medo. Ele diz o que fazia quando o medo chegava: confiava em Deus. A fé não é ausência de medo; é a decisão de confiar apesar dele.",
      "Diga a Deus do que você tem medo. Dê um nome a isso. O que é entregue em oração perde um pouco do seu poder sobre nós.",
    ],
    prayer:
      "Senhor, eu estou com medo. No dia em que eu temer, confiarei em Ti. Segura a minha mão e não me deixes sozinho. Amém.",
    reading: { book: "PSA", chapter: 91 },
    readingWhy: "O salmo da proteção de Deus sobre quem confia n'Ele.",
  },
  {
    slug: "solitario",
    label: "Solitário",
    emoji: "🥺",
    tone: "heavy",
    welcome: "Mesmo quando parece que ninguém está perto, Deus está.",
    ref: { book: "DEU", chapter: 31, verse: 8 },
    reflection: [
      "A solidão dói. Ela pode aparecer até no meio de muita gente. Mas a promessa de Deus é clara: Ele vai diante de você, está com você e não o abandona.",
      "Converse com Deus como quem conversa com um amigo. E, se puder, procure hoje alguém de confiança: uma ligação ou uma mensagem já podem fazer diferença.",
    ],
    prayer:
      "Pai, eu me sinto sozinho. Obrigado porque Tu nunca me abandonas. Enche esse vazio com a Tua presença e coloca pessoas boas no meu caminho. Amém.",
    reading: { book: "PSA", chapter: 139 },
    readingWhy: "Deus conhece você por inteiro e está em todo lugar onde você está.",
  },
  {
    slug: "coracao-partido",
    label: "Coração partido",
    emoji: "💔",
    tone: "heavy",
    welcome: "Sinto muito pela sua dor. Deus cuida de corações feridos.",
    ref: { book: "PSA", chapter: 147, verse: 3 },
    reflection: [
      "Perdas, decepções e traições deixam marcas profundas. A Bíblia apresenta Deus como Aquele que cura os de coração partido e cuida de cada ferida.",
      "A cura pode levar tempo, e tudo bem. Seja paciente com você. Deus não tem pressa com a sua dor, e caminha com você em cada etapa.",
    ],
    prayer:
      "Senhor, o meu coração está partido. Só Tu podes curar esta ferida. Cuida de mim, consola-me e restaura o que foi quebrado. Amém.",
    reading: { book: "PSA", chapter: 34 },
    readingWhy: "Um salmo sobre Deus estar perto dos que sofrem.",
  },
  {
    slug: "grato",
    label: "Grato",
    emoji: "🙏",
    tone: "joy",
    welcome: "Que lindo! Um coração grato é um coração que enxerga Deus.",
    ref: { book: "PSA", chapter: 136, verse: 1 },
    reflection: [
      "A gratidão muda o nosso olhar. Ela nos faz perceber o cuidado de Deus nas coisas grandes e nas pequenas.",
      "Que tal registrar hoje três motivos de gratidão? Assim, nos dias difíceis, você poderá lembrar de tudo o que Deus já fez.",
    ],
    prayer:
      "Pai, o meu coração está cheio de gratidão. Obrigado pela Tua bondade, que dura para sempre. Que eu nunca me esqueça dos Teus benefícios. Amém.",
    reading: { book: "PSA", chapter: 103 },
    readingWhy: "Um convite a não esquecer nenhum dos benefícios de Deus.",
  },
  {
    slug: "sem-esperanca",
    label: "Sem esperança",
    emoji: "🌧️",
    tone: "heavy",
    welcome: "Obrigado por compartilhar. Mesmo aqui, existe esperança.",
    ref: { book: "ROM", chapter: 15, verse: 13 },
    reflection: [
      "Quando a esperança parece ter acabado, lembre-se de que Deus é chamado de \"Deus da esperança\". Ela não depende de nós; ela vem d'Ele.",
      "Se você está se sentindo assim há muito tempo, ou se pensamentos de desistir da vida aparecem, procure ajuda agora: converse com alguém de confiança ou ligue para o CVV no número 188, gratuito e disponível 24 horas. Buscar ajuda também é um ato de fé.",
    ],
    prayer:
      "Deus da esperança, eu estou sem forças para esperar. Enche-me de alegria e de paz. Reacende a esperança no meu coração e coloca pessoas que me ajudem. Amém.",
    reading: { book: "LAM", chapter: 3 },
    readingWhy: "Em meio às ruínas, o profeta encontra misericórdias novas a cada manhã.",
  },
  {
    slug: "precisando-de-direcao",
    label: "Precisando de direção",
    emoji: "🧭",
    tone: "calm",
    welcome: "Deus conhece o caminho e quer guiar você.",
    ref: { book: "PRO", chapter: 3, verse: 5, verseEnd: 6 },
    reflection: [
      "Quando não sabemos que rumo tomar, a tendência é confiar apenas no próprio entendimento. A Palavra nos convida a reconhecer a Deus em todos os caminhos.",
      "Ore sobre a decisão, busque conselhos de pessoas sábias e observe a paz que Deus coloca no coração. Ele promete endireitar as suas veredas.",
    ],
    prayer:
      "Senhor, eu preciso de direção. Mostra-me o caminho que devo seguir. Dá-me sabedoria e paz para decidir conforme a Tua vontade. Amém.",
    reading: { book: "PRO", chapter: 3 },
    readingWhy: "Conselhos de sabedoria e confiança no Senhor.",
  },
  {
    slug: "precisando-de-paz",
    label: "Precisando de paz",
    emoji: "🕊️",
    tone: "calm",
    welcome: "Pare um instante. A paz de Jesus está disponível para você agora.",
    ref: { book: "JOH", chapter: 14, verse: 27 },
    reflection: [
      "Jesus deixou a Sua paz como herança para nós. É uma paz diferente: não depende de tudo estar resolvido.",
      "Feche os olhos por um momento, respire devagar e diga: \"Jesus, eu recebo a Tua paz\". Repita quantas vezes precisar.",
    ],
    prayer:
      "Jesus, eu preciso da Tua paz. Acalma o meu coração e os meus pensamentos. Que nada roube de mim a paz que Tu me deste. Amém.",
    reading: { book: "JOH", chapter: 14 },
    readingWhy: "Jesus consola os discípulos e promete a Sua paz.",
  },
  {
    slug: "precisando-de-forca",
    label: "Precisando de força",
    emoji: "💪",
    tone: "calm",
    welcome: "Você não precisa ser forte sozinho. Deus é a sua força.",
    ref: { book: "NEH", chapter: 8, verse: 10 },
    reflection: [
      "O povo de Israel chorava ao ouvir a Palavra de Deus, e Neemias os encorajou: a alegria do Senhor é a vossa força.",
      "A força que você precisa hoje pode vir de um lugar inesperado: da alegria de saber que Deus está com você e que Ele não desiste de você.",
    ],
    prayer:
      "Senhor, eu preciso de força para continuar. Seja Tu a minha força hoje. Que a Tua alegria me sustente em cada passo. Amém.",
    reading: { book: "PSA", chapter: 27 },
    readingWhy: "Um salmo de confiança: o Senhor é a força da minha vida.",
  },
];

export const sentimentoPorSlug = (slug: string) => sentimentos.find((s) => s.slug === slug);
