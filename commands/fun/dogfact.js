import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('dogfact')
    .setDescription(`Sends a lovely dog fact.`),
  async execute(interaction) {
    let response = await fetch('https://dogapi.dog/api/v2/facts');
    const data = await response.json();
    interaction.reply({
      content: '🐶' + data.data[0].attributes.body
    });
  }
}