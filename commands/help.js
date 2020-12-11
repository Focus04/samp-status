const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { reactionError, reactionSuccess, deletionTimeout } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'Displays a list of all available commands along with their usage.',
  usage: 'help (`command`)',
  async execute (message, args, prefix) {
    if (!args.length) {
      let cmds = '';
      fs.readdirSync('./commands').forEach((file) => cmds += `${prefix}${file.split('.')[0]}, `);
      const helpEmbed = new MessageEmbed()
        .setColor('#00ffbb')
        .addField('Commands', '```' + cmds + '```')
        .setTimestamp();
      await message.channel.send(helpEmbed);
      message.react(reactionSuccess);
    } else {
      const command = message.client.get(args[0].toLowerCase());
      if (!command) {
        let msg = await message.channel.send(`Couldn't find ${args[0]} in my commands list.`);
        msg.delete({ timeout: deletionTimeout });
        return message.react(reactionError);
      }
      const cmdEmbed = new MessageEmbed()
        .setColor('#00ffbb')
        .setTitle(`${prefix}${command.name}`)
        .addFields(
          { name: 'Description', value: '```' + command.description + '```'},
          { name: 'Usage', value: '```' + command.usage + '```'}
        )
        .setTimestamp();
      await message.channel.send(cmdEmbed);
      message.react(reactionSuccess);
    }
  }
}