import { readdirSync, readFileSync } from 'fs';
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getRoleColor } from '../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage.'),
  execute: async (interaction) => {
    const color = getRoleColor(interaction.guild);
    let cmds = '';
    const { botInviteLink, discordInviteLink, topgg, githubRepo } = JSON.parse(readFileSync('../config.json'));
    readdirSync('./commands').forEach((file) => cmds += `/${file.split('.')[0]} `);
    const helpEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .addFields({ name: 'Commands', value: '```' + cmds + '```' })
      .setTimestamp();
    const links = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Add me')
        .setURL(botInviteLink)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Support')
        .setURL(discordInviteLink)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Vote!')
        .setURL(topgg)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Code')
        .setURL(githubRepo)
        .setStyle(ButtonStyle.Link)
    );
    await interaction.reply({ embeds: [helpEmbed], components: [links] });
  }
}