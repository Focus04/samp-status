const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Displays the bot's current latency in ms.`),
  usage: 'ping',
  async execute(interaction) {
    const msg = await interaction.reply('Pinging...');
    interaction.editReply(`Response Latency: ${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)} ms`);
  }
}