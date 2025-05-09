// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa o Client e as permissões necessárias
const { Client, GatewayIntentBits } = require('discord.js');

// Cria uma nova instância do bot com as intenções corretas
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // Entrar em servidores
    GatewayIntentBits.GuildMessages,    // Ler mensagens em canais
    GatewayIntentBits.MessageContent    // Acessar o conteúdo das mensagens
  ]
});

// Evento que dispara quando o bot estiver online
client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

// Evento que ouve mensagens no servidor
client.on('messageCreate', (message) => {
  // Ignora mensagens de outros bots
  if (message.author.bot) return;

  // Responde 'Pong!' quando alguém digita '!ping'
  if (message.content === '!ping') {
    message.reply('Pong! 🏓');
  }
});

// Faz login no bot usando o token no .env
client.login(process.env.TOKEN);