const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); // utilise .env pour DISCORD_TOKEN et CLIENT_ID

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🌍 Déploiement global des commandes slash...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Commandes slash globales déployées (propagation ≈1h).');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement global :', error);
  }
})();
