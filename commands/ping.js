const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Displays the bot's current latency in ms.`),
  usage: 'ping',
  async execute(interaction) {
    let msg = await interaction.channel.send('Pinging...');
    msg.edit(`Response Latency: ${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)} ms`);
  }
}