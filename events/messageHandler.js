const keywords = require('../dictionary/keywords');

function handleMessage(message) {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    return message.reply('Pong! 🏓');
  }

  const content = message.content.toLowerCase();
  for (const [keyword, response] of Object.entries(keywords)) {
    if (content.includes(keyword)) {
      return message.reply(response);
    }
  }
}

module.exports = handleMessage;