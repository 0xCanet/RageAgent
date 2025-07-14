const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche l’aide de RageAgent'),
  async execute(interaction) {
    await interaction.reply({
      content: `📖 **Commandes disponibles :**\n
      • \`/analyse\` – Lance une analyse ScoRage™ d’un projet
      • \`/subscribe\` – Obtiens ton abonnement RageAgent
      • \`/help\` – Affiche ce message
      `,
      ephemeral: true
    });
  },
};
