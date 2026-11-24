import type { Journey } from "./types";

export const jornadas: Journey[] = [
  {
    slug: "7-dias-de-oracao",
    title: "7 dias de oração",
    subtitle: "Aprenda a conversar com Deus",
    description:
      "Uma semana para criar o hábito de orar. A cada dia, um ensinamento bíblico sobre a oração, uma prática simples e uma oração para começar.",
    scene: "amanhecer",
    minutesPerDay: 5,
    days: [
      {
        title: "Um lugar secreto",
        ref: { book: "MAT", chapter: 6, verse: 6 },
        reflection: [
          "Jesus ensina que a oração não é um espetáculo para os outros verem. É um encontro pessoal com o Pai, que vê em secreto.",
          "Você não precisa de palavras bonitas nem de um lugar especial. Precisa de sinceridade e de um momento só seu com Deus.",
        ],
        practice: "Escolha um lugar e um horário para orar todos os dias desta semana. Hoje, fique cinco minutos ali, em silêncio e em conversa com Deus.",
        prayer: "Pai, eu quero conhecer-Te mais. Ensina-me a orar. Aqui estou, do jeito que sou. Amém.",
      },
      {
        title: "Pai nosso",
        ref: { book: "MAT", chapter: 6, verse: 9, verseEnd: 10 },
        reflection: [
          "Quando os discípulos pediram para aprender a orar, Jesus começou com uma palavra: \"Pai\". A oração nasce de um relacionamento, e não de uma obrigação.",
          "Antes de pedir, Jesus nos ensina a honrar o nome de Deus e a desejar a Sua vontade. Isso coloca nosso coração no lugar certo.",
        ],
        practice: "Ore hoje o Pai Nosso devagar, frase por frase, pensando no significado de cada uma.",
        prayer: "Pai nosso, santificado seja o Teu nome. Que a Tua vontade se cumpra na minha vida hoje. Amém.",
      },
      {
        title: "Em tudo, com gratidão",
        ref: { book: "PHI", chapter: 4, verse: 6 },
        reflection: [
          "Paulo diz que podemos levar \"tudo\" a Deus. Não existe preocupação pequena demais nem grande demais para a oração.",
          "E ele junta os pedidos à gratidão. Agradecer antes de pedir nos lembra de tudo o que Deus já fez.",
        ],
        practice: "Antes de fazer qualquer pedido hoje, agradeça a Deus por cinco coisas.",
        prayer: "Senhor, obrigado por tudo o que já fizeste por mim. Agora Te apresento os meus pedidos com confiança. Amém.",
      },
      {
        title: "Sem desistir",
        ref: { book: "LUK", chapter: 18, verse: 1 },
        reflection: [
          "Jesus contou uma parábola para ensinar que devemos orar sempre e nunca desanimar. Algumas respostas demoram, e Deus valoriza a nossa perseverança.",
          "Continuar orando é uma forma de dizer: \"eu ainda confio em Ti\".",
        ],
        practice: "Escolha um pedido que você já tinha parado de fazer e volte a orar por ele hoje.",
        prayer: "Pai, dá-me perseverança na oração. Mesmo quando a resposta demorar, que eu continue confiando. Amém.",
      },
      {
        title: "Orando uns pelos outros",
        ref: { book: "JAM", chapter: 5, verse: 16 },
        reflection: [
          "A oração não é só por nós. Tiago nos convida a orar uns pelos outros. Interceder é um ato de amor.",
          "Quando oramos por alguém, nosso coração também se transforma: ficamos mais compassivos e menos centrados em nós mesmos.",
        ],
        practice: "Ore hoje por três pessoas pelo nome. Se puder, conte a uma delas que você orou.",
        prayer: "Senhor, eu Te apresento as pessoas que amo e também quem está sofrendo. Cuida de cada uma delas. Amém.",
      },
      {
        title: "Uma conversa contínua",
        ref: { book: "1TH", chapter: 5, verse: 17 },
        reflection: [
          "\"Orai sem cessar\" não significa ficar de joelhos o dia inteiro. Significa viver o dia inteiro em conversa com Deus, nas pequenas pausas e nos pensamentos.",
          "Uma frase rápida no trânsito, um agradecimento durante o almoço, um pedido antes de uma conversa difícil: tudo isso é oração.",
        ],
        practice: "Hoje, faça pelo menos cinco orações curtas em momentos diferentes do dia.",
        prayer: "Senhor, que eu me lembre de Ti em cada momento deste dia. Amém.",
      },
      {
        title: "Ele responde",
        ref: { book: "JER", chapter: 33, verse: 3 },
        reflection: [
          "Deus convida: \"Clama a mim, e eu te responderei\". A oração não é um monólogo: Deus ouve e responde, às vezes com um sim, às vezes com um não, às vezes com um \"espere\".",
          "Você chegou ao fim desta semana. Que a oração continue sendo o seu encontro diário com Deus.",
        ],
        practice: "Releia o que você viveu nesta semana. Anote uma coisa que mudou em você e continue com o seu horário de oração.",
        prayer: "Pai, obrigado por estes dias. Que a oração seja parte da minha vida para sempre. Amém.",
      },
    ],
  },
  {
    slug: "7-dias-de-gratidao",
    title: "7 dias de gratidão",
    subtitle: "Treine o olhar para as bênçãos",
    description:
      "Uma semana para cultivar um coração grato. Cada dia traz um versículo, uma reflexão curta e um desafio prático de gratidão.",
    scene: "campo",
    minutesPerDay: 5,
    days: [
      {
        title: "Entrar com gratidão",
        ref: { book: "PSA", chapter: 100, verse: 4 },
        reflection: [
          "O salmista nos ensina a entrar na presença de Deus com agradecimento. A gratidão é a porta de entrada para a adoração.",
          "Começar o dia agradecendo muda o tom de tudo o que vem depois.",
        ],
        practice: "Ao acordar, antes de qualquer coisa, agradeça a Deus por três coisas.",
        prayer: "Senhor, eu entro na Tua presença com gratidão. Obrigado por este dia. Amém.",
      },
      {
        title: "Em tudo",
        ref: { book: "1TH", chapter: 5, verse: 18 },
        reflection: [
          "Agradecer \"em tudo\" não é agradecer pelo mal, mas encontrar motivos de gratidão mesmo nos dias difíceis.",
          "Mesmo quando algo dá errado, ainda há algo para agradecer: a vida, o cuidado de Deus, as pessoas que nos amam.",
        ],
        practice: "Pense numa situação difícil que você vive hoje e encontre nela um motivo de gratidão.",
        prayer: "Pai, ensina-me a ser grato em todas as circunstâncias. Amém.",
      },
      {
        title: "Não se esqueça",
        ref: { book: "PSA", chapter: 103, verse: 2 },
        reflection: [
          "Davi fala com a própria alma: não te esqueças de nenhum dos benefícios de Deus. Esquecemos rápido aquilo que Deus já fez.",
          "Lembrar é um exercício de fé. Quem lembra do passado confia mais no futuro.",
        ],
        practice: "Escreva uma lista de livramentos e bênçãos que Deus já lhe deu ao longo da vida.",
        prayer: "Senhor, obrigado por tudo o que já fizeste. Que eu nunca me esqueça. Amém.",
      },
      {
        title: "Paz e gratidão",
        ref: { book: "COL", chapter: 3, verse: 15 },
        reflection: [
          "Paulo une a paz de Cristo à gratidão. Um coração grato é um coração mais tranquilo.",
          "A reclamação alimenta a inquietação; a gratidão alimenta a paz.",
        ],
        practice: "Hoje, cada vez que sentir vontade de reclamar, troque a reclamação por um agradecimento.",
        prayer: "Jesus, que a Tua paz governe o meu coração e que eu seja grato. Amém.",
      },
      {
        title: "A bondade que dura",
        ref: { book: "PSA", chapter: 136, verse: 1 },
        reflection: [
          "O Salmo 136 repete 26 vezes que a bondade de Deus dura para sempre. A repetição grava no coração aquilo que é verdade.",
          "As circunstâncias mudam, mas a bondade de Deus permanece.",
        ],
        practice: "Agradeça hoje a Deus pela bondade d'Ele em cinco áreas da sua vida.",
        prayer: "Senhor, obrigado porque a Tua bondade dura para sempre. Amém.",
      },
      {
        title: "Voltar para agradecer",
        ref: { book: "LUK", chapter: 17, verse: 15, verseEnd: 16 },
        reflection: [
          "Dez homens foram curados, mas só um voltou para agradecer a Jesus. A gratidão é uma escolha, e não algo automático.",
          "Muitas vezes recebemos e seguimos em frente. Voltar para agradecer nos aproxima ainda mais de quem nos abençoou.",
        ],
        practice: "Agradeça hoje, pessoalmente ou por mensagem, a alguém que fez diferença na sua vida.",
        prayer: "Senhor, que eu sempre volte para Te agradecer. Amém.",
      },
      {
        title: "Ele é bom",
        ref: { book: "PSA", chapter: 107, verse: 1 },
        reflection: [
          "No fim desta semana, a razão mais profunda para agradecer continua a mesma: Deus é bom.",
          "Que a gratidão se torne um hábito e transforme o seu modo de ver a vida.",
        ],
        practice: "Escolha um momento fixo do dia para continuar agradecendo, como antes de dormir.",
        prayer: "Pai, obrigado por esta semana. Que a gratidão continue em mim. Amém.",
      },
    ],
  },
];

export const jornadaPorSlug = (slug: string) => jornadas.find((j) => j.slug === slug);
