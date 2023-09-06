import { SlashCommandBuilder } from 'discord.js';
import config from '../config.json' assert { type: 'json' };

export default {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  execute: (interaction) => {
    const { botInviteLink } = config;
    interaction.reply({ content: botInviteLink, ephemeral: true });
  }
}