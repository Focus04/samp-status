import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getRoleColor } from '../../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Looks up a term in the dictionary')
    .addStringOption((option) => option
      .setName('term')
      .setDescription('The term you want to search')
      .setRequired(true)),
  async execute(interaction) {
    const term = interaction.options.getString('term');
    const response = await fetch(`http://api.urbandictionary.com/v0/define?term=${term}`);
    const data = await response.json();

    if (!data.list[0]?.definition) {
      return interaction.reply({ content: `Couldn't find any results for \`${term}\``, flags: MessageFlags.Ephemeral });
    }

    const cleanText = (text) => text.replace(/[[\]]/g, '');
    const definition = cleanText(data.list[0].definition);
    const example = cleanText(data.list[0].example);

    const color = getRoleColor(interaction.guild);
    const defineEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle(`What does ${term} mean?`)
      .addFields(
        { name: 'Definition', value: `\`\`\`${definition}\`\`\`` },
        { name: 'Example', value: `\`\`\`${example || 'N/A'}\`\`\`` },
      )
      .setTimestamp();

    interaction.reply({ embeds: [defineEmbed] });
  },
};