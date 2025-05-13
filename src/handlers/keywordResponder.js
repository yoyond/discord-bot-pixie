// src/handlers/keywordResponder.js
const fs = require('fs');
const learnedPath = './src/data/learned.json';

module.exports = (message) => {
  if (message.author.bot) return;
  if (!fs.existsSync(learnedPath)) return;

  const { categorias } = JSON.parse(fs.readFileSync(learnedPath));
  const text = message.content.toLowerCase();

  for (const cat of Object.keys(categorias)) {
    for (const entry of categorias[cat]) {
      if (text.includes(entry.frase.toLowerCase())) {
        return message.reply({ content: entry.resposta });
      }
    }
  }

  // Sem correspondência: permanece em silêncio (nenhuma DM nem reply público)
};