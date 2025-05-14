const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const learnedPath = path.join(__dirname, '../../learned.json');
const learnedData = require(learnedPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aprovar')
    .setDescription('Aprova uma nova resposta para o bot')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('A pergunta que o bot deve responder')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('resposta')
        .setDescription('A resposta que o bot deve dar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Categoria para a pergunta (use /categorias para ver as existentes)')
        .setRequired(false)),
        
  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const question = interaction.options.getString('pergunta');
    const answer = interaction.options.getString('resposta');
    let category = interaction.options.getString('categoria');

    if (!category) {
      // Se não houver categorias, force a criação de uma nova
      if (Object.keys(learnedData).length === 0) {
        return interaction.reply({
          content: 'Não há categorias existentes. Por favor, use o comando novamente especificando uma nova categoria.',
          ephemeral: true
        });
      }
      
      // Mostrar categorias existentes
      return interaction.reply({
        content: `Categorias existentes: ${Object.keys(learnedData).join(', ')}\nUse o comando novamente especificando uma categoria ou uma nova.`,
        ephemeral: true
      });
    }

    // Normaliza a categoria
    category = category.toLowerCase().trim();

    // Inicializa a categoria se não existir
    if (!learnedData[category]) {
      learnedData[category] = [];
    }

    // Adiciona a nova Q&A
    learnedData[category].push({
      question: question,
      answer: answer
    });

    // Salva no arquivo
    fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));

    await interaction.reply(`✅ Nova resposta adicionada na categoria "${category}"!`);
  }
};