const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.tempAprData = new Map();

client.commands = new Collection();

console.log('Caminho do learned.json:', path.join(process.cwd(), 'learned.json'));
console.log('Conteúdo inicial:', require('./learned.json'));

// Carregar comandos

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Handlers
client.on('interactionCreate', interaction => require('./src/handlers/interactionHandler')(interaction, client));
client.on('messageCreate', message => require('./src/handlers/keywordResponder')(message, client));

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.login(process.env.TOKEN);