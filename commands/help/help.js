import { readdirSync } from 'fs';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { getRoleColor } from '../../utils/getRoleColor.js';
import config from '../../config.json' assert { type: 'json' };

const getCommandNames = (dir) => readdirSync(dir)
  .map((file) => `/${file.slice(0, file.lastIndexOf('.'))}`)
  .join('\n');

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage'),
  async execute(interaction) {
    const color = getRoleColor(interaction.guild);
    const { botInviteLink, StoreLink, discordInviteLink } = config;

    const commandCategories = {
      '🎮 Server Query Commands': './commands/query',
      '🎈 Fun Commands': './commands/fun',
      '💡 Help Commands': './commands/help',
    };

    const helpEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle('Slash Commands')
      .setTimestamp();

    for (const [name, path] of Object.entries(commandCategories)) {
      helpEmbed.addFields({
        name,
        value: `\`\`\`${getCommandNames(path)}\`\`\``,
        inline: true,
      });
    }

    helpEmbed.addFields({
      name: 'Useful links',
      value: `[Add SAMP Status](${botInviteLink})  [Support Server](${discordInviteLink})`
    });

    const links = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Become a partner now')
        .setURL(StoreLink)
        .setStyle(ButtonStyle.Link),
    );

    await interaction.reply({ embeds: [helpEmbed], components: [links] });
  },
};