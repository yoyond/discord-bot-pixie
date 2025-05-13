const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); // Carrega TOKEN e CLIENT_ID do .env

const commands = [];
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  if ('data' in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🌐 Registrando comandos GLOBAIS...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('✅ Comandos globais registrados com sucesso!');
    console.log('⚠️ Pode levar até 1 hora para aparecer globalmente!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos globais:', error);
  }
})();
