const GUILD_ID = '123456789012345678'; // coloque o ID do seu servidor

(async () => {
  try {
    console.log('📍 Registrando comandos de GUILD para testes...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('🌍 Registrando comandos GLOBAIS...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();