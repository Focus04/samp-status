const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botInviteLink, githubRepo } = require('../config.json');
const { getRoleColor } = require('../utils/getRoleColor');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage.'),
  async execute(interaction) {
    const color = getRoleColor(interaction.guild);
    let cmds = '';
    fs.readdirSync('./commands').forEach((file) => cmds += `/${file.split('.')[0]} `);
    const helpEmbed = new MessageEmbed()
      .setColor(color.hex)
      .addFields({ name: 'Commands', value: '```' + cmds + '```' })
      .setTimestamp();
    const links = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel('Add Me')
        .setURL(botInviteLink)
        .setStyle('LINK'),
      new MessageButton()
        .setLabel('Source Code')
        .setURL(githubRepo)
        .setStyle('LINK')
    );
    await interaction.reply({ embeds: [helpEmbed], components: [links] });
  }
}