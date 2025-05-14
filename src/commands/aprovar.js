const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const suggestCategory = require('../utils/suggestCategory'); // função aprimorada

const filePath = path.join(__dirname, '../data/learned.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aprovar')
    .setDescription('Aprova uma nova frase e resposta para o bot.')
    .addStringOption(option =>
      option.setName('frase')
        .setDescription('Frase que o bot deve reconhecer')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('resposta')
        .setDescription('Resposta que o bot deve dar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Categoria da frase')
        .setAutocomplete(true) // Habilita sugestões
        .setRequired(false)
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const categorias = Object.keys(data.categorias || {});
    const filtered = categorias.filter(c => c.startsWith(focusedValue));
    await interaction.respond(
      filtered.map(c => ({ name: c, value: c }))
    );
  },

  async execute(interaction) {
    const frase = interaction.options.getString('frase');
    const resposta = interaction.options.getString('resposta');
    let categoria = interaction.options.getString('categoria');

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (!categoria) {
      // Sugere automaticamente
      categoria = suggestCategory(frase, data.categorias);
    }

    if (!categoria) {
      return await interaction.reply({
        content: `❌ Não consegui sugerir uma categoria. Use o campo "categoria" manualmente.`,
        ephemeral: true
      });
    }

    if (!data.categorias[categoria]) {
      data.categorias[categoria] = [];
    }

    data.categorias[categoria].push({ frase, resposta });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    await interaction.reply({
      content: `✅ Frase aprovada e adicionada à categoria \`${categoria}\`.`,
      ephemeral: true
    });
  }
};