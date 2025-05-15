const path = require('path');
const fs = require('fs');

module.exports = async (interaction, client) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
       if (!interaction.replied) {
        await command.execute(interaction);
       }
    }

      if (interaction.isModalSubmit()) {
      if (interaction.customId === 'aprovarModal') {

      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'aprovarModal') {
        const input = interaction.fields.getTextInputValue('categoriaInput');
        const temp = client.tempAprData.get(interaction.user.id);
        if (!temp) return interaction.reply({ content: '❌ Dados temporários não encontrados.', ephemeral: true });

        const learnedPath = path.join(process.cwd(), 'learned.json');
        let learnedData = {};
        
        if (fs.existsSync(learnedPath)) {
          learnedData = JSON.parse(fs.readFileSync(learnedPath));
        }

        const categoriaFinal = (input.toLowerCase() === 'sim' && temp.sugest)
          ? temp.sugest
          : input.toLowerCase();

        if (!learnedData[categoriaFinal]) {
          learnedData[categoriaFinal] = [];
        }

        learnedData[categoriaFinal].push({
          question: temp.frase,  // Padronizado para 'question'
          answer: temp.resposta  // Padronizado para 'answer'
        });

        fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));

        await interaction.reply({
          content: `✅ Frase aprovada na categoria \`${categoriaFinal}\`!`,
          ephemeral: true
        });
      }
    }
  } catch (err) {
    console.error(err);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ Ocorreu um erro ao processar sua interação.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Ocorreu um erro ao processar sua interação.', ephemeral: true });
      }
    } catch (e) {
      console.error('❌ Erro ao enviar resposta de erro:', e);
    }
  }
};