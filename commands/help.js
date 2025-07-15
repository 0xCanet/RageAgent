const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche l’aide de ScoRage'),
  async execute(interaction) {
    await interaction.reply({
      content: `📖 **Commandes disponibles :**\n
      • \`/analyse\` – Lance une analyse ScoRage™ d’un projet
      • \`/subscribe\` – Obtiens ton abonnement ScoRage
      • \`/help\` – Affiche ce message
      `,
      ephemeral: true
    });
  },
};
