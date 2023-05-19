import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoleColor } from '../utils/getRoleColor';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription(`Checks how many servers the bot is in.`),
  async execute(interaction) {
    let color = getRoleColor(interaction.guild);
    let membercount = 0;
    interaction.client.guilds.cache.forEach((guild) => membercount += guild.memberCount);
    const infoEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Bot info')
      .addFields(
        { name: 'Server Count', value: interaction.client.guilds.cache.size.toString() },
        { name: 'User Count', value: membercount.toString() }
      )
      .setTimestamp();
    interaction.reply({ embeds: [infoEmbed] });
  }
}