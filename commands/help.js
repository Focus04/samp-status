import { readdirSync } from 'fs';
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getRoleColor } from '../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage.'),
  execute: async (interaction) => {
    const color = getRoleColor(interaction.guild);
    const botInviteLink = 'https://discord.com/api/oauth2/authorize?client_id=786612528951197726&permissions=0&scope=bot%20applications.commands';
    const discordInviteLink = 'https://discord.com/api/oauth2/authorize?client_id=786612528951197726&permissions=0&scope=bot%20applications.commands';
    const topgg = 'https://top.gg/bot/786612528951197726';
    const githubRepo = 'https://github.com/Focus04/samp-status';
    let cmds = '';
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