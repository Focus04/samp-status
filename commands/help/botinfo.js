import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoleColor } from '../../utils/getRoleColor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Checks how many servers the bot is in'),
  async execute(interaction) {
    const color = getRoleColor(interaction.guild);
    let memberCount = 0;

    interaction.client.guilds.cache.forEach((guild) => {
      memberCount += guild.memberCount;
    });

    const infoEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle('Bot Information')
      .addFields(
        { name: 'Server Count', value: interaction.client.guilds.cache.size.toString() },
        { name: 'Members Across All Servers', value: memberCount.toString() },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [infoEmbed] });
  },
};