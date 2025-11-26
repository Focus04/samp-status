import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Displays the bot's current latency in ms.`),
  execute: async (interaction) => {
    const msg = await interaction.reply({ content: 'Pinging...', withResponse: true });
    interaction.editReply(`Response Latency: ${msg.createdTimestamp - interaction.createdTimestamp} ms`);
  }
}