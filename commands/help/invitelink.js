import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import config from '../../config.json' assert { type: 'json' };

export default {
  data: new SlashCommandBuilder()
    .setName('invitelink')
    .setDescription('Sends the invite link for the bot.'),
  execute: (interaction) => {
    const { botInviteLink, discordInviteLink } = config;
    interaction.reply({
      content: `Bot invite: ${botInviteLink}\nDiscord invite: ${discordInviteLink}`,
      flags: MessageFlags.Ephemeral
    });
  }
}