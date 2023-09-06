import { SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  execute: (interaction) => {
    const { botInviteLink } = JSON.parse(readFileSync('../config.json'));
    interaction.reply({ content: botInviteLink, ephemeral: true });
  }
}