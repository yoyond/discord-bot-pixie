const Fuse = require('fuse.js');
const keywords = require('../dictionary/keywords');

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s]/g, "") // remove pontuação
    .trim();
}

const phrases = Object.keys(keywords).map(phrase => ({
  phrase,
  normalized: normalize(phrase)
}));

const fuse = new Fuse(phrases, {
  keys: ['normalized'],
  includeScore: true,
  threshold: 0.4 
});

function handleMessage(message) {
  if (message.author.bot) return;

  const content = normalize(message.content);

  const result = fuse.search(content);

  if (result.length > 0) {
    const bestMatch = result[0];
    if (bestMatch.score <= 0.4) {
      const response = keywords[bestMatch.item.phrase];
      return message.reply(response);
    }
  }

}

module.exports = handleMessage;