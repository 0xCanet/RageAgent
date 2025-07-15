const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

    const bouton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`open_analyse_modal:${langue}`)
        .setLabel('📝 Remplir le formulaire')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: `Langue choisie : **${langue}**\nClique sur le bouton ci-dessous pour remplir le formulaire.`,
      components: [bouton],
      flags: 64 // équivalent à ephemeral: true, mais sans warning
    });
  }
};
