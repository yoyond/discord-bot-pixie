const { SlashCommandBuilder } = require('discord.js');
const fileManager = require('../../fileManager');
const fs = require('fs');
const path = require('path');

const learnedPath = path.join(process.cwd(), 'learned.json');


function debugFilesystem() {
  console.log('=== DEBUG DO SISTEMA DE ARQUIVOS ===');
  console.log('Diretório atual:', process.cwd());
  console.log('Conteúdo do diretório:', fs.readdirSync(process.cwd()));
  try {
    console.log('Conteúdo de learned.json:', fs.readFileSync(learnedPath, 'utf8'));
  } catch (e) {
    console.log('learned.json não existe ou não pode ser lido');
  }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aprovar')
        .setDescription('Adiciona nova resposta ao bot')
        .addStringOption(option =>
            option.setName('pergunta')
                .setDescription('O que o usuário vai perguntar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('resposta')
                .setDescription('O que o bot deve responder')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Nome da categoria (deixe em branco para sugestões)')
                .setRequired(false)),

    async execute(interaction) {
        // Debug inicial
        debugFilesystem();

        try {
            // Carrega ou cria o arquivo
            let learnedData = {};
            if (fs.existsSync(learnedPath)) {
                learnedData = JSON.parse(fs.readFileSync(learnedPath, 'utf8'));
            } else {
                fs.writeFileSync(learnedPath, JSON.stringify({}, null, 2));
            }

            // ... (restante da lógica do comando)

            // Persistência com verificação EXTRA
            fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));
            console.log('Arquivo supostamente salvo em:', learnedPath);
            
            // Verificação pós-escrita
            debugFilesystem(); // Mostra o estado após escrita
            
            await interaction.reply({
                content: `✔️ Resposta adicionada! Verifique os logs para confirmação.`,
                ephemeral: true
            });

        } catch (error) {
            console.error('❌ ERRO:', error);
            debugFilesystem();
            await interaction.reply({
                content: '⚠️ Erro ao salvar! Verifique os logs do servidor.',
                ephemeral: true
            });
        }
    }
};