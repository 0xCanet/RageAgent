const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🧹 Suppression des commandes locales...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );

    console.log('✅ Commandes locales supprimées.');
  } catch (error) {
    console.error('❌ Erreur purge locale :', error);
  }
})();