const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function importData() {
  const raw = fs.readFileSync('learned.json', 'utf8');
  const json = JSON.parse(raw);

  for (const category in json) {
    const items = json[category];
    for (const item of items) {
      await prisma.learnedPhrase.create({
        data: {
          question: item.question,
          answer: item.answer,
          category,
          author: item.author || 'desconhecido',
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        }
      });
    }
  }

  console.log('✅ Importação concluída!');
  await prisma.$disconnect();
}

importData().catch(e => {
  console.error('Erro na importação:', e);
  prisma.$disconnect();
});
