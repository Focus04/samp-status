import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { botInviteLink, githubRepo } from '../config.json';
import { getRoleColor } from '../utils/getRoleColor';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands along with their usage.')
    .addStringOption((option) => option
      .setName('command')
      .setDescription('The command to view info about.')
    ),
  usage: 'help (`command`)',
  async execute(interaction) {
    const color = getRoleColor(message.guild);
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
      await message.channel.send({ embeds: [helpEmbed] });
    } else {
      const command = message.client.commands.get(args[0].toLowerCase());
      if (!command) {
        let msg = await message.channel.send(`Couldn't find ${args[0]} in my commands list.`);
      }
      const cmdEmbed = new MessageEmbed()
        .setColor(color.hex)
        .setTitle(`/${command.name}`)
        .addFields(
          { name: 'Description', value: command.description },
          { name: 'Usage', value: command.usage }
        )
        .setTimestamp();
      await message.channel.send({ embeds: [cmdEmbed] });
    }
  }
}