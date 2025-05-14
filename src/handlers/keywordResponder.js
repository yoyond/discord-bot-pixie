const { findBestMatch, refreshLearnedData } = require('../utils/responseMatcher');

let lastResponseTime = 0;
const RESPONSE_COOLDOWN = 3000;

module.exports = async (message, client) => {
  if (message.author.bot) return;
  if (Date.now() - lastResponseTime < RESPONSE_COOLDOWN) return;

  // Verifica se é um comando de atualização 
  if (message.content === '!atualizar' && message.member.permissions.has('ADMINISTRATOR')) {
    refreshLearnedData();
    await message.reply('✅ Banco de dados de respostas atualizado!');
    return;
  }

  const match = findBestMatch(message.content);
  if (match) {
    try {
      await message.reply(match.answer);
      lastResponseTime = Date.now();
    } catch (error) {
      console.error('Error replying to message:', error);
    }
  }
};