import { SlashCommandBuilder } from 'discord.js'
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('catfact')
    .setDescription(`Same as dogfact, except it's for cats.`),
  async execute(interaction) {
    const response = await fetch('https://catfact.ninja/facts?limit=1&max_length=140%27');
    const data = await response.json();
    interaction.reply({ content: data.data[0].fact });
  }
}