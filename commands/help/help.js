import { readdirSync } from 'fs';
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getRoleColor } from '../../utils/getRoleColor.js';
import config from '../../config.json' assert { type: 'json' };

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage.'),
  execute: async (interaction) => {
    const color = getRoleColor(interaction.guild);
    let funCmds = '', helpCmds = '', serverCmds = '';
    readdirSync('./commands/fun').forEach((file) => funCmds += `/${file.slice(0, file.lastIndexOf('.'))}\n`);
    readdirSync('./commands/help').forEach((file) => helpCmds += `/${file.slice(0, file.lastIndexOf('.'))}\n`);
    readdirSync('./commands/query').forEach((file) => serverCmds += `/${file.slice(0, file.lastIndexOf('.'))}\n`);
    const { botInviteLink, discordInviteLink, topgg, githubRepo } = config;
    const helpEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle('Slash Commands')
      .addFields(
        {
          name: `🎮 Server Query Commands`,
          value: `${'```' + serverCmds + '```'}`, inline: true
        },
        {
          name: `🎈 Fun Commands`,
          value: `${'```' + funCmds + '```'}`, inline: true
        },
        {
          name: `💡 Help Commands`,
          value: `${'```' + helpCmds + '```'}`, inline: true
        }
      )
      .setTimestamp();
    const links = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Add me')
        .setURL(botInviteLink)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Support Server')
        .setURL(discordInviteLink)
        .setStyle(ButtonStyle.Link)
    );
    await interaction.reply({ embeds: [helpEmbed], components: [links] });
  }
}