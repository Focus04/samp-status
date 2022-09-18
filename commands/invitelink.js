import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../config.js';
const { botInviteLink } = config;

export default {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  execute: (interaction) => {
    interaction.reply({ content: botInviteLink, ephemeral: true });
  }
}