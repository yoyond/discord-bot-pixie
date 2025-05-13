const fs = require('fs');
const path = require('path');
const learnedFile = path.join(__dirname, '../../dictionary/learned.json');
const keywords = require('../../dictionary/keywords');

module.exports = {
  async execute(message) {
    if (!message.content.startsWith('/aprovar')) return;
    if (!message.member.permissions.has('ADMINISTRATOR')) return;

    const args = message.content.split('"');
    const frase = args[1];
    const categoria = args[3];

    const learnedData = JSON.parse(fs.readFileSync(learnedFile, 'utf-8'));

    if (!learnedData[frase]) return message.author.send('Essa frase não está na lista de sugestões.');

    // Atualiza keywords
    if (!keywords[categoria]) {
      keywords[categoria] = "Resposta padrão da categoria nova. Edite no keywords.js";
    }

    keywords[frase] = keywords[categoria];

    // Remove do learned.json
    delete learnedData[frase];

    fs.writeFileSync(learnedFile, JSON.stringify(learnedData, null, 2));

    const keywordsPath = path.join(__dirname, '../dictionary/keywords.js');
    fs.writeFileSync(keywordsPath, `module.exports = ${JSON.stringify(keywords, null, 2)};`);

    message.reply(`✅ A frase "${frase}" foi adicionada à categoria "${categoria}".`);
  }
};