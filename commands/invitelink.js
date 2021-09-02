const { SlashCommandBuilder } = require('@discordjs/builders');
const { botInviteLink } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  usage: 'invitelink',
  guildOnly: true,
  execute(interaction) {
    message.channel.send(botInviteLink);
  }
}