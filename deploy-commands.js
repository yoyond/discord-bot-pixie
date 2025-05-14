require('dotenv').config(); 
const { REST, Routes } = require('discord.js');
const fs = require('fs');


const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;


if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Verifique se TOKEN, CLIENT_ID e GUILD_ID estão definidos no .env');
  process.exit(1);
}

const commands = [];
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}


const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('📍 Registrando comandos de GUILD para testes...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('✅ Comandos de GUILD registrados com sucesso!');

    console.log('🌍 Registrando comandos GLOBAIS...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );

    console.log('✅ Comandos GLOBAIS registrados com sucesso!');
    console.log('⚠️ Pode levar até 1 hora para comandos globais aparecerem.');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();
