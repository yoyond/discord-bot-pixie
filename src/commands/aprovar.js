const { SlashCommandBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aprovar')
    .setDescription('Adiciona nova frase ao banco de dados.')
    .addStringOption(opt => 
      opt.setName('pergunta').setDescription('Pergunta').setRequired(true))
    .addStringOption(opt => 
      opt.setName('resposta').setDescription('Resposta').setRequired(true))
    .addStringOption(opt => 
      opt.setName('categoria').setDescription('Categoria').setRequired(true))
      .addChoices(
      { name: 'brincadeiras', value: 'brincadeiras' },
      { name: 'interacao_social', value: 'interacao_social' },
      { name: 'versão', value: 'versao' },
      { name: 'whitelist', value: 'whitelist'},
      { name: 'entrada_no_servidor', value: 'entrada_no_servidor' },
    ),
  
  async execute(interaction) {
    const pergunta = interaction.options.getString('pergunta');
    const resposta = interaction.options.getString('resposta');
    const categoria = interaction.options.getString('categoria');

    try {
      await prisma.learnedPhrase.create({
        data: {
          question: pergunta,
          answer: resposta,
          category: categoria,
          author: interaction.user.username,
        }
      });

      await interaction.reply({
        content: `✅ Frase aprovada e adicionada na categoria **${categoria}**.`,
        ephemeral: true
      });
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao salvar a frase.',
        ephemeral: true
      });
    }
  }
};