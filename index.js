require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const handleMessage = require('./events/messageHandler');
const aprovarCommand = require('./events/messageCreate/aprovar');  

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});



client.on('messageCreate', (message) => {
  aprovarCommand.execute(message);
  handleMessage(message);
});

client.on('messageCreate', handleMessage);

client.login(process.env.TOKEN);
