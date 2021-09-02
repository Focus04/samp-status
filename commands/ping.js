import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Displays the bot's current latency in ms.`),
  usage: 'ping',
  async execute(interaction) {
    const msg = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    interaction.editReply(`Response Latency: ${msg.createdTimestamp - interaction.createdTimestamp} ms`);
  }
}