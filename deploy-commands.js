const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); // utilise .env pour TOKEN, CLIENT_ID, GUILD_ID

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔁 Déploiement des commandes slash (guild)...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log('✅ Commandes mises à jour pour le serveur.');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
  }
})();
