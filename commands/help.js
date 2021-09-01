const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const {
  reactionError,
  reactionSuccess,
  botInviteLink,
  githubRepo
} = require('../config.json');
const { getRoleColor } = require('../utils/getRoleColor');

module.exports = {
  name: 'help',
  description: 'Displays a list of all available commands along with their usage.',
  usage: 'help (`command`)',
  async execute(message, args, prefix) {
    const color = getRoleColor(message.guild);
    if (!args.length) {
      let cmds = '';
      fs.readdirSync('./commands').forEach((file) => cmds += `${prefix}${file.split('.')[0]} `);
      const helpEmbed = new MessageEmbed()
        .setColor(color.hex)
        .addFields(
          { name: 'Commands', value: '```' + cmds + '```' },
          { name: 'Useful Links', value: `[Add me on your server!](${botInviteLink}) [Code](${githubRepo})` }
        )
        .setTimestamp();
      await message.channel.send({ embeds: [helpEmbed] });
      message.react(reactionSuccess);
    } else {
      const command = message.client.commands.get(args[0].toLowerCase());
      if (!command) {
        let msg = await message.channel.send(`Couldn't find ${args[0]} in my commands list.`);
        return message.react(reactionError);
      }
      const cmdEmbed = new MessageEmbed()
        .setColor(color.hex)
        .setTitle(`${prefix}${command.name}`)
        .addFields(
          { name: 'Description', value: command.description },
          { name: 'Usage', value: command.usage }
        )
        .setTimestamp();
      await message.channel.send({ embeds: [cmdEmbed] });
      message.react(reactionSuccess);
    }
  }
}