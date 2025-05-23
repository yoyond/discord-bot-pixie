const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (interaction, client) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      if (!interaction.replied) {
        await command.execute(interaction);
      }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'aprovarModal') {
      const input = interaction.fields.getTextInputValue('categoriaInput');
      const temp = client.tempAprData.get(interaction.user.id);
      if (!temp) return interaction.reply({ content: '❌ Dados temporários não encontrados.', ephemeral: true });

      const categoriaFinal = (input.toLowerCase() === 'sim' && temp.sugest)
        ? temp.sugest
        : input.toLowerCase();

      await prisma.learnedPhrase.create({
        data: {
          question: temp.frase,
          answer: temp.resposta,
          category: categoriaFinal,
          author: interaction.user.username,
        }
      });

      await interaction.reply({
        content: `✅ Frase aprovada na categoria \`${categoriaFinal}\`!`,
        ephemeral: true
      });
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