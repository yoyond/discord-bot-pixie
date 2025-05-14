const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Caminho universal que funciona em qualquer ambiente
const learnedPath = path.join(process.cwd(), 'learned.json');

// Garante que o arquivo existe com estrutura válida
function initializeLearnedFile() {
  if (!fs.existsSync(learnedPath)) {
    fs.writeFileSync(learnedPath, JSON.stringify({}, null, 2));
    console.log('Arquivo learned.json criado em:', learnedPath);
  }
}

// Carrega os dados com tratamento robusto de erros
function loadLearnedData() {
  try {
    initializeLearnedFile();
    const rawData = fs.readFileSync(learnedPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Erro crítico ao ler learned.json:', error);
    return {};
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aprovar')
    .setDescription('Adiciona uma nova resposta ao bot')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('A pergunta que o bot deve responder')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('resposta')
        .setDescription('A resposta que o bot deve dar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Categoria para a pergunta (deixe em branco para ver opções)')
        .setRequired(false)),
        
  async execute(interaction) {
    // Verificação de permissão com fallback
    if (!interaction.member?.permissions?.has('ADMINISTRATOR')) {
      return interaction.reply({ 
        content: '❌ Acesso negado: você precisa ter permissão de administrador.',
        ephemeral: true 
      });
    }

    // Carrega dados frescos a cada execução
    const learnedData = loadLearnedData();
    const question = interaction.options.getString('pergunta').trim();
    const answer = interaction.options.getString('resposta').trim();
    let category = interaction.options.getString('categoria')?.trim();

    // Lógica melhorada para categorias
    if (!category) {
      const categories = Object.keys(learnedData);
      
      if (categories.length === 0) {
        return interaction.reply({
          content: 'ℹ️ Não há categorias existentes. Por favor, especifique uma nova categoria:',
          components: [/* Aqui você pode adicionar botões com sugestões */],
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `📚 Categorias disponíveis:\n${categories.map(c => `• ${c}`).join('\n')}\n\n` +
                 'Digite o comando novamente incluindo a categoria desejada.',
        ephemeral: true
      });
    }

    // Normalização avançada da categoria
    category = category.toLowerCase()
      .replace(/[^\w\u00C0-\u00FF\- ]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_'); // Espaços vira underscores

    // Validação da entrada
    if (!question || !answer) {
      return interaction.reply({
        content: '⚠️ Pergunta e resposta não podem estar vazias!',
        ephemeral: true
      });
    }

    // Cria estrutura se não existir
    if (!learnedData[category]) {
      learnedData[category] = [];
    }

    // Verifica duplicatas
    const duplicate = learnedData[category].some(item => 
      item.question.toLowerCase() === question.toLowerCase()
    );
    
    if (duplicate) {
      return interaction.reply({
        content: `⚠️ Já existe uma resposta para "${question}" nesta categoria.`,
        ephemeral: true
      });
    }

    // Adiciona a nova entrada
    learnedData[category].push({
      question: question,
      answer: answer,
      createdBy: interaction.user.tag,
      createdAt: new Date().toISOString()
    });

    // Persistência com múltiplas camadas de segurança
    try {
      // Cria backup antes de escrever
      const backupPath = `${learnedPath}.bak`;
      if (fs.existsSync(learnedPath)) {
        fs.copyFileSync(learnedPath, backupPath);
      }

      // Escreve o novo arquivo
      fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));
      
      // Verificação pós-escrita
      const verifyData = JSON.parse(fs.readFileSync(learnedPath));
      if (!verifyData[category]) {
        throw new Error('Falha na verificação pós-escrita');
      }

      console.log(`📝 Entrada registrada em ${category} por ${interaction.user.tag}`);
      await interaction.reply({
        content: `✅ Resposta adicionada com sucesso na categoria "${category.replace(/_/g, ' ')}"!`,
        ephemeral: true
      });

    } catch (error) {
      console.error('🚨 Falha ao salvar learned.json:', error.stack);
      
      // Tenta restaurar o backup
      try {
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, learnedPath);
        }
      } catch (restoreError) {
        console.error('🚨 CRÍTICO: Falha ao restaurar backup:', restoreError);
      }

      await interaction.reply({
        content: '❌ Erro grave ao salvar. Os administradores foram alertados.',
        ephemeral: true
      });
    }
  }
};