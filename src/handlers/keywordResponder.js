const { PrismaClient } = require('@prisma/client');
const Fuse = require('fuse.js');

const prisma = new PrismaClient();

let lastResponseTime = 0;
const RESPONSE_COOLDOWN = 3000; // 3 segundos
let cachedData = [];
let fuse = null;

// Função para carregar/atualizar os dados do banco
async function loadLearnedData() {
  cachedData = await prisma.learnedPhrase.findMany();
  fuse = new Fuse(cachedData, {
    keys: ['question'],
    threshold: 0.3, // Quanto menor, mais exata a busca
  });
}

module.exports = async (message, client) => {
  if (message.author.bot) return;

  const now = Date.now();
  if (now - lastResponseTime < RESPONSE_COOLDOWN) return;

  // Recarregar banco manualmente
  if (
    message.content === '!atualizar' &&
    message.member?.permissions?.has?.('Administrator')
  ) {
    await loadLearnedData();
    await message.reply('✅ Banco de dados atualizado com sucesso!');
    return;
  }

  // Garante que os dados estão carregados
  if (!fuse || cachedData.length === 0) {
    await loadLearnedData();
  }

  const results = fuse.search(message.content);

  if (results.length > 0) {
    const match = results[0].item;
    try {
      await message.reply(match.answer);
      lastResponseTime = now;
    } catch (error) {
      console.error('❌ Erro ao responder mensagem:', error);
    }
  }
};
