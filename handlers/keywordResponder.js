const fs = require('fs');
const path = './src/data/learned.json';

module.exports = (message, client) => {
  if (message.author.bot) return;
  if (!fs.existsSync(path)) return;

  const { categorias } = JSON.parse(fs.readFileSync(path));

  for (const categoria of Object.keys(categorias)) {
    for (const item of categorias[categoria]) {
      const match = item.frase.toLowerCase();
      if (message.content.toLowerCase().includes(match)) {
        message.reply(item.resposta);
        return;
      }
    }
  }
};