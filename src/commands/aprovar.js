const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const learnedPath = path.join(process.cwd(), 'learned.json');

function ensureLearnedFile() {
    if (!fs.existsSync(learnedPath)) {
        fs.writeFileSync(learnedPath, JSON.stringify({}, null, 2));
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
        // Verifica se já foi respondido
        if (interaction.replied) return;

        ensureLearnedFile();

        const rawData = fs.readFileSync(learnedPath, 'utf8');
        const learnedData = JSON.parse(rawData);

        const question = interaction.options.getString('pergunta');
        const answer = interaction.options.getString('resposta');
        let category = interaction.options.getString('categoria');

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

        if (!learnedData[category]) {
            learnedData[category] = [];
        }

        learnedData[category].push({
            question: question.trim(),
            answer: answer.trim(),
            timestamp: new Date().toISOString(),
            author: interaction.user.tag
        });

        try {
            fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));
            const verifyData = fs.readFileSync(learnedPath, 'utf8');
            JSON.parse(verifyData);
            
            console.log(`✅ [${new Date().toISOString()}] Entrada salva em ${learnedPath}`);
            
            // Só responde se não for um modal
            if (!interaction.isModalSubmit()) {
                await interaction.reply({
                    content: `✔️ Resposta adicionada em "${category}"!`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('❌ ERRO GRAVE AO SALVAR:', error);
            await interaction.reply({
                content: '⚠️ Erro ao salvar! Verifique os logs do servidor.',
                ephemeral: true
            });
        }
    }
};