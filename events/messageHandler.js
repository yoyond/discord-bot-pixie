const Fuse = require('fuse.js');
const keywordGroups = require('../dictionary/keywords');
const normalize = require('../utils/normalize');
const fs = require('fs');
const path = require('path');

// Monta as frases normalizadas
const allPhrases = [];
for (const [category, data] of Object.entries(keywordGroups)) {
  data.phrases.forEach(phrase => {
    allPhrases.push({
      phrase,
      normalized: normalize(phrase),
      category
    });
  });
}

const fuse = new Fuse(allPhrases, {
  keys: ['normalized'],
  includeScore: true,
  threshold: 0.3
});

function handleMessage(message) {
  if (message.author.bot) return;

  const content = normalize(message.content);
  if (content.length < 3) return;

  // Exato
  for (const item of allPhrases) {
    if (normalize(content) === item.normalized) {
      const response = keywordGroups[item.category].response;
      return message.reply(typeof response === 'function' ? response(content) : response);
    }
  }

  // Por partes
  const parts = content.split(/[.?!,;]+|\\s+/g).map(normalize).filter(p => p.length >= 3);
  for (const part of parts) {
    const result = fuse.search(part);
    if (result.length > 0 && result[0].score <= 0.3) {
      const item = result[0].item;
      const response = keywordGroups[item.category].response;
      return message.reply(typeof response === 'function' ? response(content) : response);
    }
  }

  // Se não encontrou nada, salva no learned
  const learnedFile = path.join(__dirname, '../dictionary/learned.json');
  const learned = JSON.parse(fs.readFileSync(learnedFile, 'utf-8'));

  if (!learned[message.content]) {
    learned[message.content] = { suggested: true };
    fs.writeFileSync(learnedFile, JSON.stringify(learned, null, 2));
  }
}

module.exports = handleMessage;
