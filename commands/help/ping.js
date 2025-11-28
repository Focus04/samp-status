import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Displays the bot's current latency in ms.`),
  execute: async (interaction) => {
    const replyMessage = await interaction.reply({
      content: '📡 Pinging...',
      fetchReply: true
    });
    const botLatency = replyMessage.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = interaction.client.ws.ping;
    interaction
      .editReply({ content: `📡 Bot Latency: ${botLatency} ms\n💓 Discord API Latency: ${apiLatency}` })
      .catch((err) => console.log(`WARNING: Connection timed out trying to get ping.`));
  }
}