const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Commandes disponibles du bot ScoRage™'),
  async execute(interaction) {
    await interaction.reply({
      ephemeral: true,
      content: "**Commandes disponibles :**\n\n`/analyse [Langue]` → Lance une analyse ScoRage du projet (Français uniquement disponible pour le moment).\n`/help` → Affiche cette aide\n\nSupport : https://discord.gg/invite/HVBX4DWdmZ"
    });
  }
};
