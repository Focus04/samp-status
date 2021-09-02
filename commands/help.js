const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { botInviteLink, githubRepo } = require('../config.json');
const { getRoleColor } = require('../utils/getRoleColor');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage.')
    .addStringOption((option) => option
      .setName('command')
      .setDescription('The command to view info about.')
    ),
  usage: 'help (`command`)',
  async execute(interaction) {
    const color = getRoleColor(interaction.guild);
    const args = interaction.options.data.map((option) => option.value);
    if (!args.length) {
      let cmds = '';
      fs.readdirSync('./commands').forEach((file) => cmds += `/${file.split('.')[0]} `);
      const helpEmbed = new MessageEmbed()
        .setColor(color.hex)
        .addFields(
          { name: 'Commands', value: '```' + cmds + '```' },
          { name: 'Useful Links', value: `[Add me on your server!](${botInviteLink}) [Code](${githubRepo})` }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [helpEmbed] });
    } else {
      const command = interaction.client.commands.get(args[0].toLowerCase());
      if (!command) await interaction.reply(`Couldn't find ${args[0]} in my commands list.`);
      const cmdEmbed = new MessageEmbed()
        .setColor(color.hex)
        .setTitle(`/${command.name}`)
        .addFields(
          { name: 'Description', value: interaction.command.description },
          { name: 'Usage', value: command.usage }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [cmdEmbed] });
    }
  }
}