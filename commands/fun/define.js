import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription(`Looks up a term in the dictionary.`)
    .addStringOption((option) => option
      .setName('term')
      .setDescription('The term you want to search.')
      .setRequired(true)
    ),
  async execute(interaction) {
    const term = interaction.options.getString('term');
    const response = await fetch(`http://api.urbandictionary.com/v0/define?term=${term}`);
    const data = await response.json();
    if (!data.list[0] || !data.list[0].definition) {
      return interaction.reply({ content: `Couldn't find any results for ${'`' + term + '`'}`, ephemeral: true });
    }

    const definition = data.list[0].definition
      .split('[')
      .join('')
      .split(']')
      .join('');
    const example = data.list[0].example
      .split('[')
      .join('')
      .split(']')
      .join('');
    let color = getRoleColor(interaction.guild);
    const defineEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`What does ${term} mean?`)
      .addFields(
        { name: 'Definition', value: '```' + definition + '```' },
        { name: 'Example', value: '```' + (example || 'N/A') + '```' }
      )
      .setTimestamp();
    interaction.reply({ embeds: [defineEmbed] });
  }

}