const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const learnedPath = path.join(process.cwd(), 'learned.json');
console.log('Caminho do learned.json:', learnedPath); // Log do caminho

// Garante que o arquivo existe com estrutura válida
function ensureLearnedFile() {
    try {
        if (!fs.existsSync(learnedPath)) {
            fs.writeFileSync(learnedPath, JSON.stringify({}, null, 2));
            console.log('Arquivo learned.json criado com sucesso');
        } else {
            console.log('Arquivo learned.json já existe');
        }
    } catch (error) {
        console.error('Erro ao verificar learned.json:', error);
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
        ensureLearnedFile();

        try {
            // Carrega os dados atuais com verificação robusta
            let learnedData = {};
            if (fs.existsSync(learnedPath)) {
                const rawData = fs.readFileSync(learnedPath, 'utf8');
                learnedData = JSON.parse(rawData);
                console.log('Dados carregados:', Object.keys(learnedData).length, 'categorias');
            }

            const question = interaction.options.getString('pergunta');
            const answer = interaction.options.getString('resposta');
            let category = interaction.options.getString('categoria');

            // Lógica de categorias
            if (!category) {
                const categories = Object.keys(learnedData);
                if (categories.length === 0) {
                    return interaction.reply({
                        content: '⚠️ Digite o nome da NOVA categoria:',
                        ephemeral: true
                    });
                }
                return interaction.reply({
                    content: `📂 Categorias existentes:\n${categories.join('\n')}\n\nDigite o nome da categoria ou um novo.`,
                    ephemeral: true
                });
            }

            category = category.toLowerCase().trim().replace(/[^\w\s-]/g, '');

            // Inicializa categoria se não existir
            if (!learnedData[category]) {
                learnedData[category] = [];
                console.log('Nova categoria criada:', category);
            }

            // Adiciona a nova entrada
            learnedData[category].push({
                question: question.trim(),
                answer: answer.trim(),
                timestamp: new Date().toISOString(),
                author: interaction.user.tag
            });

            // Persistência com verificação reforçada
            fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));
            console.log('Dados salvos com sucesso em:', learnedPath);
            
            // Verificação pós-escrita
            const verifyData = fs.readFileSync(learnedPath, 'utf8');
            JSON.parse(verifyData);
            
            await interaction.reply({
                content: `✔️ Resposta adicionada em "${category}"!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('❌ ERRO GRAVE:', error);
            console.error('Stack trace:', error.stack);
            
            await interaction.reply({
                content: '⚠️ Erro ao salvar! Verifique os logs do servidor.',
                ephemeral: true
            });
        }
    }
};