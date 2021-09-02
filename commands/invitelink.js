const { SlashCommandBuilder } = require('@discordjs/builders');
const { botInviteLink } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  execute(interaction) {
    interaction.reply({ content: botInviteLink, ephemeral: true });
  }
}