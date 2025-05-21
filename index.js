const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [],
});

// Estruturas internas
client.tempAprData = new Map();
client.commands = new Collection();


const loadCommands = async () => {
  const commandFiles = fs.readdirSync('./src/commands')
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const command = require(`./src/commands/${file}`);
      if (command.data?.name) {
        client.commands.set(command.data.name, command);
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar comando ${file}:`, error);
    }
  }
  console.log(`📦 ${client.commands.size} comandos carregados`);
};

// Handlers de eventos
const loadHandlers = () => {
  try {
    client.on('interactionCreate', interaction => 
      require('./src/handlers/interactionHandler')(interaction, client));
    
    client.on('messageCreate', message => 
      require('./src/handlers/keywordResponder')(message, client));

    console.log('🔄 Handlers carregados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao carregar handlers:', error);
  }
};

// Evento on ready
client.once('ready', () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`👥 Usuários: ${client.users.cache.size}`);
});


const initBot = async () => {
  try {
    await loadCommands();
    loadHandlers();
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.error('❌ Falha crítica na inicialização:', error);
    process.exit(1);
  }
};

// Hot reload em dev
if (process.env.NODE_ENV !== 'production') {
  const chokidar = require('chokidar');
  const watcher = chokidar.watch('./src');
  watcher.on('change', (path) => {
    console.log(`♻️ Arquivo alterado: ${path}`);
    delete require.cache[require.resolve(path)];
  });
}

initBot();
