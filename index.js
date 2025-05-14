const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Adicionado
require('dotenv').config();

// Configuração inicial mais robusta
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // Adicionado para melhor suporte a comandos de admin
  ],
  partials: [], // Adicione se precisar de suporte a mensagens parciais
});

// Inicialização de estruturas de dados
client.tempAprData = new Map();
client.commands = new Collection();
client.learnedData = {}; // Adicionado para cache opcional

// Verificação do arquivo learned.json na inicialização
const learnedPath = path.join(process.cwd(), 'learned.json');
try {
  if (!fs.existsSync(learnedPath)) {
    fs.writeFileSync(learnedPath, JSON.stringify({}, null, 2));
    console.log('Arquivo learned.json criado em:', learnedPath);
  }
  client.learnedData = require(learnedPath);
  console.log(`✅ Learned.json carregado com ${Object.keys(client.learnedData).length} categorias`);
} catch (error) {
  console.error('❌ Erro ao carregar learned.json:', error);
  process.exit(1); // Encerra se não conseguir carregar o arquivo essencial
}

// Carregamento dinâmico de comandos com tratamento de erros
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

// Handlers com verificação de carregamento
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

// Evento ready com informações úteis
client.once('ready', () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`👥 Usuários: ${client.users.cache.size}`);
});

// Inicialização segura
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

// Hot reload para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  const chokidar = require('chokidar');
  const watcher = chokidar.watch('./src');
  watcher.on('change', (path) => {
    console.log(`♻️ Arquivo alterado: ${path}`);
    delete require.cache[require.resolve(path)];
  });
}

initBot();