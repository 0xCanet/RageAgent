require('dotenv').config();
const {
  Client, Collection, GatewayIntentBits, Events,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  ActionRowBuilder, InteractionType
} = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');

const WEBHOOK_SECRET_TOKEN = process.env.WEBHOOK_SECRET_TOKEN;
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

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
    // Slash command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // Bouton "ouvrir le formulaire"
    if (interaction.isButton() && interaction.customId.startsWith('open_analyse_modal')) {
      const langue = interaction.customId.split(':')[1] || 'fr';

      const modal = new ModalBuilder()
        .setCustomId(`analyse_form:${langue}`)
        .setTitle('Formulaire d\'analyse')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('project_name')
              .setLabel('Nom du projet')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('project_url')
              .setLabel('Site Web')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('whitepaper_url')
              .setLabel('Whitepaper (URL de téléchargement uniquement)')
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('contract_address')
              .setLabel('Adresse du contrat')
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          )
        );

      await interaction.showModal(modal);
      return;
    }

    // Bouton abonnement
    if (interaction.isButton() && interaction.customId === 'subscribe_button') {
      await interaction.reply({
        content: `🧠 Génération du lien d’abonnement... regarde tes MP dans quelques secondes.`,
        flags: 64
      });
      return;
    }

    // Soumission du formulaire
    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId.startsWith('analyse_form')
    ) {
      await interaction.deferReply({ ephemeral: true });

      const langue = interaction.customId.split(':')[1] || 'fr';
      const name = interaction.fields.getTextInputValue('project_name');
      const url = interaction.fields.getTextInputValue('project_url');
      const whitepaper = interaction.fields.getTextInputValue('whitepaper_url');
      const address = interaction.fields.getTextInputValue('contract_address');
      const chain_id = 1;

      console.log("📨 Formulaire reçu:", {
        name, url, whitepaper, address, langue, user: interaction.user.id
      });

      let roles = [];
      let hasScoRageRole = false;

      if (interaction.guild) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        roles = member.roles.cache.map(role => role.name);
        hasScoRageRole = roles.includes('ScoRage');
      } else {
        hasScoRageRole = true; // Autorisé en DM
      }

      if (!hasScoRageRole) {
        await interaction.editReply({
          content: `❌ Tu dois avoir le rôle **ScoRage** pour utiliser cette fonctionnalité.\n\nUtilise la commande \`/subscribe\` ou contacte un admin.`,
          flags: 64
        });
        return;
      }

      const webhookURL = 'https://hook.eu2.make.com/v5cjhvkqc3q916sxesbnkiyr9f6qvnjr';
      console.log("🚀 Envoi à Make:", {
        project_name: name,
        project_url: url,
        whitepaper_url: whitepaper,
        contract_address: address,
        chain_id,
        language: langue,
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        channel_id: interaction.channelId,
        user_roles: roles
      });

      const res = await fetch.default(webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-make-apikey': WEBHOOK_SECRET_TOKEN
        },
        body: JSON.stringify({
          project_name: name,
          project_url: url,
          whitepaper_url: whitepaper,
          contract_address: address,
          chain_id,
          language: langue,
          guild_id: interaction.guildId,
          user_id: interaction.user.id,
          channel_id: interaction.channelId,
          user_roles: roles
        })
      });

      const responseText = await res.text();
      console.log("✅ Réponse Make:", res.status, responseText);

      if (!res.ok) {
        await interaction.editReply({
          content: `❌ Échec de l’analyse (code ${res.status}) : ${responseText}`
        });
        return;
      }

const steps = [
  '1️⃣ Fundamentals',
  '2️⃣ Infra/Tokenomics',
  '3️⃣ Reputation',
  '4️⃣ Engagement',
  '5️⃣ Scam Signals'
];

let stepIndex = 0;

// Affiche tout en "⏳" au début (rien validé)
let status = steps.map((s, idx) =>
  idx === 0 ? `⏳ ${s}` : `▫️ ${s}`
).join('\n');

await interaction.editReply({
  content: `🧠 Analyse ScoRage™ en cours pour **${name}**...\n\n${status}`
});

for (stepIndex = 0; stepIndex < steps.length; stepIndex++) {
  await new Promise(res => setTimeout(res, 12000)); // 12s par step pour 1min total

  status = steps.map((s, idx) =>
    idx < stepIndex + 1 ? `✅ ${s}` :
    idx === stepIndex + 1 ? `⏳ ${steps[idx + 1] || ''}` : // Prochain step en cours
    `▫️ ${s}`
  ).join('\n');

  await interaction.editReply({
    content: `🧠 Analyse ScoRage™ en cours pour **${name}**...\n\n${status}`
  });
}

// Message final (PDF en cours…)
await interaction.editReply({
  content: `✅ Analyse ScoRage™ terminée sur les 5 piliers !\n\nGénération du rapport PDF en cours...\n\n⏳ Cette étape peut prendre encore plusieurs dizaines de secondes selon le projet analysé. Merci de patienter !`
});

    }

  } catch (err) {
    console.error("❌ Erreur interaction :", {
      message: err.message,
      stack: err.stack
    });

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Erreur interne.', flags: 64 });
      } else {
        await interaction.reply({ content: 'Erreur interne.', flags: 64 });
      }
    } catch (e) {
      console.error("❌ Erreur fallback :", e);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
