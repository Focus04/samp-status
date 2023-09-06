import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  execute: (interaction) => {
    const botInviteLink = 'https://discord.com/api/oauth2/authorize?client_id=786612528951197726&permissions=0&scope=bot%20applications.commands';
    interaction.reply({ content: botInviteLink, ephemeral: true });
  }
}