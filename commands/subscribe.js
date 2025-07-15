const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Abonne-toi pour débloquer l’analyse complète ScoRage™'),

  async execute(interaction) {
    const fetch = (await import('node-fetch')).default;

    // 🔐 Acknowledge immédiatement
    await interaction.deferReply({ ephemeral: true });

    const userId = interaction.user.id;
    const guildId = interaction.guild ? interaction.guild.id : null;

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

      // ✅ Réponse finale après traitement
      await interaction.editReply({
        content: `🧠 Génération du lien d’abonnement... regarde tes MP dans quelques secondes.`,
      });
    } catch (err) {
      console.error('❌ Erreur webhook Make:', err);
      await interaction.editReply({
        content: '❌ Erreur interne, merci de réessayer plus tard.'
      });
    }
  },
};
