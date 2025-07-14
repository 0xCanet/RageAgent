const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Abonne-toi pour débloquer l’analyse complète ScoRage™'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const webhookUrl = 'https://hook.eu2.make.com/r23ipqjuvlxqoqn2m76qd6t6rn729tr4'; // Remplace ici aussi

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        guild_id: guildId
      })
    });

    await interaction.reply({
      content: `🧠 Génération du lien d’abonnement... regarde tes MP dans quelques secondes.`,
      ephemeral: true
    });
  },
};
