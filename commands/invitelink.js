import { SlashCommandBuilder } from 'discord.js';
import { botInviteLink } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  execute: (interaction) => {
    interaction.reply({ content: botInviteLink, ephemeral: true });
  }
}