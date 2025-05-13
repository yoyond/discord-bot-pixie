const fs = require('fs');
const learnedPath = './src/data/learned.json';

module.exports = async (interaction, client) => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try { await cmd.execute(interaction); }
    catch (err) {
      console.error(err);
      return interaction.reply({ content: '❌ Erro ao executar.', ephemeral: true });
    }
  }

  // Modal submit para /aprovar
  if (interaction.isModalSubmit() && interaction.customId === 'aprovarModal') {
    const { frase, resposta, sugest } = client.tempAprData.get(interaction.user.id) || {};
    const categoriaInput = interaction.fields.getTextInputValue('categoriaInput').trim().toLowerCase();
    const categoria = (categoriaInput === 'sim' && sugest) ? sugest : categoriaInput;

    // Carrega ou inicializa learned.json
    let data = { categorias: {} };
    if (fs.existsSync(learnedPath)) {
      data = JSON.parse(fs.readFileSync(learnedPath));
    }
    if (!data.categorias[categoria]) data.categorias[categoria] = [];
    data.categorias[categoria].push({ frase, resposta });
    fs.writeFileSync(learnedPath, JSON.stringify(data, null, 2));

    // Limpa o temp store e responde
    client.tempAprData.delete(interaction.user.id);
    return interaction.reply({
      content: `✅ Frase adicionada à categoria **${categoria}**!`,
      ephemeral: true
    });
  }
};