const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Abonne-toi pour débloquer l’analyse complète ScoRage™'),
  async execute(interaction) {
    const fetch = (await import('node-fetch')).default;

    await interaction.reply({
      content: `🧠 Génération du lien d’abonnement...`,
      ephemeral: true
    });

    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const webhookUrl = 'https://hook.eu2.make.com/r23ipqjuvlxqoqn2m76qd6t6rn729tr4';

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          guild_id: guildId
        })
      });
    } catch (err) {
      console.error('❌ Erreur webhook Make:', err);
    }
  },
};
