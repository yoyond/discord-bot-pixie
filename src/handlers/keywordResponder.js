const { PrismaClient } = require('@prisma/client');
const Fuse = require('fuse.js');
const dictionary = require('../data/dictionary');

const prisma = new PrismaClient();

let lastResponseTime = 0;
const RESPONSE_COOLDOWN = 3000;
let cachedData = [];
let fuse = null;

async function loadLearnedData() {
  // Carrega dados do Prisma e do dictionary.js
  const prismaData = await prisma.learnedPhrase.findMany();
  const dictionaryData = Object.entries(dictionary).flatMap(([category, items]) => 
    items.map(item => ({
      question: item.question,
      answer: item.answer,
      category,
      author: item.author || 'Sistema'
    }))
  );

  cachedData = [...prismaData, ...dictionaryData];
  fuse = new Fuse(cachedData, {
    keys: ['question'],
    threshold: 0.3,
  });
}

function normalizeInput(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, '');
}

module.exports = async (message, client) => {
  if (message.author.bot) return;

  const now = Date.now();
  if (now - lastResponseTime < RESPONSE_COOLDOWN) return;


  if (message.content === '!atualizar' && message.member?.permissions?.has?.('Administrator')) {
    await loadLearnedData();
    await message.reply('✅ Banco de dados atualizado com sucesso!');
    return;
  }


  if (!fuse || cachedData.length === 0) {
    await loadLearnedData();
  }

  const normalized = normalizeInput(message.content);


  if (message.content.trim().split(/\s+/).length < 2) return;

  const exactMatch = cachedData.find(item =>
    normalizeInput(item.question) === normalized ||
    (item.aliases && item.aliases.some(alias => normalizeInput(alias) === normalized))
  );

  if (exactMatch) {
    await message.reply(exactMatch.answer);
    lastResponseTime = now;
    return;
  }

  const results = fuse.search(message.content);
  if (results.length > 0 && results[0].score < 0.4) {
    const match = results[0].item;
    try {
      await message.reply(match.answer);
      lastResponseTime = now;
    } catch (error) {
      console.error('❌ Erro ao responder mensagem:', error);
    }
  }
};