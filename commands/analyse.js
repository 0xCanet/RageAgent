const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('analyse')
    .setDescription('Lancer une analyse de projet')
    .addStringOption(option =>
      option.setName('langue')
        .setDescription('Langue du rapport')
        .setRequired(true)
        .addChoices(
          { name: 'Français', value: 'fr' },
          { name: 'English', value: 'en' }
        )
    ),
  async execute(interaction) {
    const langue = interaction.options.getString('langue');

    const bouton = {
      type: 1,
      components: [
        {
          type: 2,
          style: 1,
          label: '📝 Remplir le formulaire',
          custom_id: `open_analyse_modal:${langue}`
        }
      ]
    };

    await interaction.reply({
      content: `Langue choisie : **${langue}**\nClique sur le bouton ci-dessous pour remplir le formulaire.`,
      components: [bouton],
      ephemeral: true
    });
  }
};
