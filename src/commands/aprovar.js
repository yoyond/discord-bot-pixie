const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');
const fs = require('fs');
const suggestCategory = require('../utils/suggestCategory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aprovar')
    .setDescription('Aprova uma nova frase para o bot responder')
    .addStringOption(opt =>
      opt.setName('frase')
         .setDescription('Frase que o bot deve reconhecer')
         .setRequired(true))
    .addStringOption(opt =>
      opt.setName('resposta')
         .setDescription('Resposta que o bot deve dar')
         .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const frase = interaction.options.getString('frase');
    const resposta = interaction.options.getString('resposta');
    const learnedPath = './src/data/learned.json';

    // Carrega dados existentes
    let data = { categorias: {} };
    if (fs.existsSync(learnedPath)) {
      data = JSON.parse(fs.readFileSync(learnedPath));
    }

    // Gera sugestão de categoria
    const sugest = suggestCategory(frase, data.categorias);

    // Guarda temporariamente no client (para recuperar no ModalSubmit)
    interaction.client.tempAprData.set(interaction.user.id, { frase, resposta, sugest });

    // Cria e exibe um Modal para o usuário confirmar/definir categoria
    const modal = new ModalBuilder()
      .setCustomId('aprovarModal')
      .setTitle('Aprovar nova frase');

    const input = new TextInputBuilder()
      .setCustomId('categoriaInput')
      .setLabel(`Sugestão: ${sugest || 'nenhuma'}. Digite "sim" para aceitar ou digite a categoria`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  }
};