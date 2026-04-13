import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } from 'discord.js';
import { getRoleColor } from '../../utils/getRoleColor.js';
import config from '../../config.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getCommandNames = (dir) => {
  readdirSync(dir).map((file) => `> \`/${file.slice(0, file.lastIndexOf('.'))}\``).join('\n');
}

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage'),

  async execute(interaction) {
    const color = getRoleColor(interaction.guild);
    const { botInviteLink, storeLink, discordInviteLink, githubRepo } = config;

    const commandCategories = {
      '🎮 Server Query': join(__dirname, '../query'),
      '🎈 Fun': join(__dirname, '../fun'),
      '💡 Help': join(__dirname, '../help'),
    };

    const helpEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setAuthor({ name: `${interaction.client.user.username} | Help Menu` })
      .setDescription('Explore all available commands below. Type `/` in the chat to see their specific options and arguments!')
      .setTimestamp()

    for (const [name, path] of Object.entries(commandCategories)) {
      helpEmbed.addFields({
        name,
        value: getCommandNames(path),
        inline: true,
      });
    }

    helpEmbed.addFields({
      name: '🔗 Useful links',
      value: `[Add SAMP Status](${botInviteLink}) • [Support Server](${discordInviteLink}) • [GitHub](${githubRepo})`
    });

    const linksRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Become a partner now')
        .setEmoji('✅')
        .setURL(storeLink)
        .setStyle(ButtonStyle.Link),
    );

    await interaction.reply({ embeds: [helpEmbed], components: [linksRow] });
  },
};