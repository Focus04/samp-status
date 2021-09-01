const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const prefixes = new Keyv(process.env.prefixes);
const { reactionError, reactionSuccess } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Changes the default prefix to a custom one.')
    .addStringOption((option) => option
      .setName('prefix')
      .setDescription('The new prefix.')
      .setRequired(true)
    ),
  usage: 'setprefix `prefix`',
  requiredPerms: 'MANAGE_GUILD',
  permError: 'You require the Manage Server permission in order to run this command.',
  async execute(interaction) {
    if (!args[0]) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}setprefix [prefix]`);
      return message.react(reactionError);
    }

    if (!message.member.permissions.has('MANAGE_GUILD')) {
      let msg = await message.channel.send('You need the Manage Server permission in order to run this command.');
      return message.react(reactionError);
    }

    await prefixes.set(message.guild.id, args[0]);
    const config = message.client.guildConfigs.get(message.guild.id);
    config.prefix = args[0];
    message.client.guildConfigs.set(message.guild.id, config);
    message.react(reactionSuccess);
    message.channel.send(`Server prefix successfully changed to ${args[0]}.`);
  }
}