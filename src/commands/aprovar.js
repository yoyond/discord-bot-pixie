const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Caminho CORRETO para o learned.json na raiz
const learnedPath = path.join(__dirname, '../../learned.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aprovar')
    .setDescription('Adiciona uma nova resposta ao bot')
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
        .setDescription('Categoria para a pergunta (use /categorias para ver existentes)')
        .setRequired(false)),
        
  async execute(interaction) {
    // Verificação CORRETA de permissões
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ 
        content: '❌ Você precisa ser administrador para usar este comando.', 
        ephemeral: true 
      });
    }

    // Carrega os dados ATUALIZADOS a cada execução
    let learnedData = {};
    try {
      learnedData = JSON.parse(fs.readFileSync(learnedPath));
    } catch (error) {
      console.error('Erro ao ler learned.json:', error);
      learnedData = {};
    }

    const question = interaction.options.getString('pergunta');
    const answer = interaction.options.getString('resposta');
    let category = interaction.options.getString('categoria');

    // Lógica para categorias
    if (!category) {
      const categories = Object.keys(learnedData);
      if (categories.length === 0) {
        return interaction.reply({
          content: '⚠️ Nenhuma categoria existente. Por favor, especifique uma nova categoria.',
          ephemeral: true
        });
      }
      return interaction.reply({
        content: `📂 Categorias disponíveis: ${categories.join(', ')}\n` +
                 'Use o comando novamente especificando uma categoria.',
        ephemeral: true
      });
    }

    // Normaliza a categoria
    category = category.toLowerCase().trim();

    // Cria categoria se não existir
    if (!learnedData[category]) {
      learnedData[category] = [];
    }

    // Adiciona a nova entrada
    learnedData[category].push({
      question: question,
      answer: answer
    });

    // Salva o arquivo COM tratamento de erro
    try {
      fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));
      console.log(`✅ Nova entrada salva em ${learnedPath}`);
      await interaction.reply(`✔️ Resposta adicionada na categoria "${category}"!`);
    } catch (error) {
      console.error('Erro ao salvar learned.json:', error);
      await interaction.reply('❌ Erro ao salvar a resposta. Verifique os logs.');
    }
  }
};