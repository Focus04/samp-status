import { readdirSync } from 'fs';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import config from '../config.js';
const { botInviteLink, discordInviteLink, topgg, githubRepo } = config;
import { getRoleColor } from '../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage.'),
  execute: async (interaction) => {
    const color = getRoleColor(interaction.guild);
    let cmds = '';
    readdirSync('./commands').forEach((file) => cmds += `/${file.split('.')[0]} `);
    const helpEmbed = new MessageEmbed()
      .setColor(color.hex)
      .addFields({ name: 'Commands', value: '```' + cmds + '```' })
      .setTimestamp();
    const links = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel('Add me')
        .setURL(botInviteLink)
        .setStyle('LINK'),
      new MessageButton()
        .setLabel('Support')
        .setURL(discordInviteLink)
        .setStyle('LINK'),
      new MessageButton()
        .setLabel('Vote!')
        .setURL(topgg)
        .setStyle('LINK'),
      new MessageButton()
        .setLabel('Code')
        .setURL(githubRepo)
        .setStyle('LINK')
    );
    await interaction.reply({ embeds: [helpEmbed], components: [links] });
  }
}