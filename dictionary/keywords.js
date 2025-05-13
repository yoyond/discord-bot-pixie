module.exports = {
  greetings: {
    phrases: ["olá", "ola", "oi", "salve"],
    response: "Olá! Como posso ajudar você? 👋"
  },
  farewell: {
    phrases: ["tchau", "bye", "até"],
    response: "Até mais! 👋"
  },
  goodDay: {
    phrases: ["bom dia", "boa tarde", "boa noite"],
    response: (phrase) => {
      if (phrase.includes("bom dia")) return "Bom dia ☀ vamos jogar juntos?";
      if (phrase.includes("boa tarde")) return "Boa tardeee ☕";
      if (phrase.includes("boa noite")) return "Boa noite!";
    }
  },
  botIdentity: {
    phrases: [
      "quem é você?",
      "pixie",
      "me ajuda pixie"
    ],
    response: "Oi! Sou a Pixie, a assistente do servidor Cyber Pixel! 🌎 Como posso te ajudar?"
  },
  thanks: {
    phrases: ["obrigado", "vlw", "valeu"],
    response: "De nada! haha 😊"
  },
  ipHelp: {
    phrases: [
      "onde esta o ip?",
      "cade o ip do serve",
      "onde pego o ip do serve",
      "como acho o ip",
      "ip"
    ],
    response: "O IP do servidor está aqui: <#1365853461442465792> na barra de canais 😄"
  },
  entryHelp: {
    phrases: [
      "nao consigo entrar no servidor",
      "como entra",
      "como entra no server",
      "como faço para entra no serve"
    ],
    response: "Para entrar no servidor você deve fazer a <#1365842315201220708>. Posso te ajudar em algo mais? 😍"
  },
  clanHelp: {
    phrases: [
      "como faço para entrar em um cla",
      "algum cla tem vagas",
      "estou procurando um cla",
      "como cria um cla",
      "posso cria cla"
    ],
    response: "Você deve visitar o canal <#1370449570500317264> para ver vagas ou criar um clã. Boa sorte! 🍀"
  },
  whitelist: {
    phrases: [
      "ja fiz whitelist",
      "fiz whitelist",
      "wl feita",
      "fiz wl",
      "ja fiz a white list, como faço para entrar no server",
      "ja fiz a white list"
    ],
    response: "Que bom! Agora é só aguardar sua liberação! 🥳"
  }
};