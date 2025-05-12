const Fuse = require('fuse.js');
const keywords = require('../dictionary/keywords');

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s]/g, "") // remove pontuação
    .trim();
}

const phrases = Object.keys(keywords).map(phrase => ({ phrase }));

const fuse = new Fuse(phrases, {
  keys: ['phrase'],
  includeScore: true,
  threshold: 0.3 // 😀 quanto menor mais exato (0.3 é um bom equilíbrio)
});

function handleMessage(message) { //isso ignora tudo que vem de outro bot
  if (message.author.bot) return;

  const content = normalize(message.content);

  const result = fuse.search(content);

  if (result.length > 0) {
    const bestMatch = result[0].item.phrase;
    const response = keywords[bestMatch];
    return message.reply(response);
  }
}

module.exports = handleMessage;