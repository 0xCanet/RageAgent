require('dotenv').config();
const {
  Client, Collection, GatewayIntentBits, Events,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType
} = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();

// Chargement des commandes
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    // Slash command (/analyse ou /subscribe)
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    }

    // Bouton "Ouvrir le formulaire"
    if (interaction.isButton() && interaction.customId.startsWith('open_analyse_modal')) {
      const langue = interaction.customId.split(':')[1] || 'fr';

      const modal = new ModalBuilder()
        .setCustomId(`analyse_form:${langue}`)
        .setTitle('Formulaire d\'analyse');

      const nameInput = new TextInputBuilder()
        .setCustomId('project_name')
        .setLabel('Nom du projet')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const urlInput = new TextInputBuilder()
        .setCustomId('project_url')
        .setLabel('Site Web')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const whitepaperInput = new TextInputBuilder()
        .setCustomId('whitepaper_url')
        .setLabel('Whitepaper (URL de téléchargement uniquement)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const addressInput = new TextInputBuilder()
        .setCustomId('contract_address')
        .setLabel('Adresse du contrat')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(urlInput),
        new ActionRowBuilder().addComponents(whitepaperInput),
        new ActionRowBuilder().addComponents(addressInput)
      );

      // ❌ NE PAS faire de reply ici
      await interaction.showModal(modal);
      return;
    }

    // Bouton "S’abonner"
    if (interaction.isButton() && interaction.customId === 'subscribe_button') {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const webhookUrl = 'https://hook.make.com/TON_WEBHOOK_ID'; // Remplace par ton URL Make

      await fetch.default(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          guild_id: guildId
        })
      });

      await interaction.reply({
        content: `🧠 Génération du lien d’abonnement... regarde tes MP dans quelques secondes.`,
        flags: 64
      });
      return;
    }

    // Formulaire envoyé
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('analyse_form')) {
      const langue = interaction.customId.split(':')[1] || 'fr';

      const name = interaction.fields.getTextInputValue('project_name');
      const url = interaction.fields.getTextInputValue('project_url');
      const whitepaper = interaction.fields.getTextInputValue('whitepaper_url');
      const address = interaction.fields.getTextInputValue('contract_address');
      const chain_id = 1; // Ethereum par défaut

      // 🔐 Récupération des rôles de l'utilisateur
      let roles = [];
      let hasScoRageRole = false;

      if (interaction.guild) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        roles = member.roles.cache.map(role => role.name);
        hasScoRageRole = roles.includes("ScoRage");
      }

      // 🔒 Si pas de rôle ScoRage, on bloque
      if (!hasScoRageRole) {
        await interaction.reply({
          content: `❌ Tu dois avoir le rôle **ScoRage** pour utiliser cette fonctionnalité.\n\nUtilise la commande \`/subscription\` ou contacte un admin.`,
          flags: 64
        });
        return;
      }

      // ✅ On continue si autorisé
      await interaction.reply({
        content: `🧠 Analyse en cours pour **${name}**...`,
        flags: 64
      });

      const webhookURL = 'https://hook.eu2.make.com/v5cjhvkqc3q916sxesbnkiyr9f6qvnjr'; // à adapter
      await fetch.default(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: name,
          project_url: url,
          whitepaper_url: whitepaper,
          contract_address: address,
          chain_id: chain_id,
          language: langue,
          guild_id: interaction.guildId,
          user_id: interaction.user.id,
          channel_id: interaction.channelId,
          user_roles: roles
        })
      });
    }

  } catch (err) {
    console.error("❌ Erreur interaction :", err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Erreur interne.', flags: 64 });
    } else {
      await interaction.reply({ content: 'Erreur interne.', flags: 64 });
    }
  }
});

// 🔁 Message réutilisable "Pas d’abonnement"
async function sendSubscriptionPrompt(interaction) {
  await interaction.reply({
    content: `❌ Tu n’as pas encore d’abonnement actif à RageAgent.\n\n🔥 Pour débloquer l’analyse complète ScoRage™, clique ci-dessous :`,
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('subscribe_button')
          .setLabel('🧠 S’abonner')
          .setStyle(ButtonStyle.Primary)
      )
    ],
    flags: 64
  });
}

client.login(process.env.DISCORD_TOKEN);
